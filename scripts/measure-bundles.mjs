#!/usr/bin/env node
/**
 * First-party JavaScript per route.
 *
 *     node scripts/measure-bundles.mjs before
 *     node scripts/measure-bundles.mjs after
 *
 * Next 16 with Turbopack no longer prints "First Load JS" in the build table,
 * so this measures the thing directly: fetch each route, collect every
 * `/_next/static/**.js` the HTML references (script tags, modulepreloads and
 * the inlined flight payload), and sum their sizes on disk and gzipped.
 *
 * First-party only. Third-party tags are measured separately by
 * scripts/measure-lighthouse.mjs — mixing them hides which side moved.
 *
 * Needs a production server running on PERF_ORIGIN (default :3100) built with
 * the flag matching the label.
 */

import { createGzip } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const label = process.argv[2];
if (!["before", "after"].includes(label)) {
  console.error("usage: node scripts/measure-bundles.mjs <before|after>");
  process.exit(1);
}

const ORIGIN = process.env.PERF_ORIGIN ?? "http://localhost:3100";

const ROUTES = [
  { key: "home", path: "/" },
  { key: "collection", path: "/tours/group-tours" },
  { key: "landing", path: "/lp/from-venice" },
  { key: "tour", path: "/tours/venice-dolomites-cortina-misurina-day-trip", afterOnly: true },
  { key: "catalog", path: "/tours", afterOnly: true },
];

async function gzippedSize(buffer) {
  let total = 0;
  const sink = new (await import("node:stream")).Writable({
    write(chunk, _enc, cb) {
      total += chunk.length;
      cb();
    },
  });
  await pipeline(Readable.from(buffer), createGzip({ level: 9 }), sink);
  return total;
}

const results = {};

for (const route of ROUTES) {
  if (route.afterOnly && label === "before") continue;

  const response = await fetch(`${ORIGIN}${route.path}`);
  const html = await response.text();

  // Every first-party chunk the document pulls in, however it is referenced.
  const chunks = new Set(
    [...html.matchAll(/\/_next\/static\/[^"'\\\s)]+?\.js/g)].map((m) => m[0])
  );

  let raw = 0;
  let gzip = 0;
  let missing = 0;

  for (const chunk of chunks) {
    const onDisk = join(process.cwd(), ".next", chunk.replace("/_next/", ""));
    if (!existsSync(onDisk)) {
      missing++;
      continue;
    }
    raw += statSync(onDisk).size;
    gzip += await gzippedSize(readFileSync(onDisk));
  }

  results[route.key] = {
    url: route.path,
    chunks: chunks.size,
    rawKb: Math.round(raw / 1024),
    gzipKb: Math.round(gzip / 1024),
    htmlKb: Math.round(Buffer.byteLength(html) / 1024),
    ...(missing ? { chunksNotFoundOnDisk: missing } : {}),
  };

  console.log(
    `${route.path.padEnd(52)} ${String(results[route.key].chunks).padStart(3)} chunks  ` +
      `${String(results[route.key].gzipKb).padStart(5)} KB gzip  ` +
      `${String(results[route.key].rawKb).padStart(6)} KB raw  ` +
      `${String(results[route.key].htmlKb).padStart(4)} KB html`
  );
}

const outDir = join(process.cwd(), "docs", "perf");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `bundles-${label}.json`);
writeFileSync(
  outFile,
  `${JSON.stringify({ label, origin: ORIGIN, measuredAt: new Date().toISOString(), results }, null, 2)}\n`
);
console.log(`\nWrote ${outFile}`);
