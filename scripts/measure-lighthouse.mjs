#!/usr/bin/env node
/**
 * Before/after Core Web Vitals for the Regiondo migration.
 *
 *     node scripts/measure-lighthouse.mjs before
 *     node scripts/measure-lighthouse.mjs after
 *
 * Runs Lighthouse's default mobile preset — Moto G Power, 4x CPU throttle,
 * simulated slow 4G — against a production build served locally, and writes a
 * JSON summary to `docs/perf/<label>.json`.
 *
 * Each page is measured RUNS times and the **median** is reported. A single
 * Lighthouse run on a developer machine is noisy enough that an unchanged page
 * can swing five performance points and half a second of LCP between runs, and
 * a before/after built on single samples would mostly be measuring that noise.
 * The `/` control row exists for the same reason: nothing about it changed, so
 * whatever it moves by is the noise floor for the rest of the table.
 *
 * The two runs are the same commit with `REGIONDO_NATIVE_BOOKING` off and on,
 * so the comparison isolates the change rather than mixing in unrelated drift.
 *
 * The server must already be running (`pnpm build && pnpm start -p 3100`) with
 * the flag set to match the label — the script does not manage it, because
 * rebuilding between runs is what makes the comparison honest and that is
 * better done deliberately.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const label = process.argv[2];
if (!label || !["before", "after"].includes(label)) {
  console.error("usage: node scripts/measure-lighthouse.mjs <before|after>");
  process.exit(1);
}

const ORIGIN = process.env.PERF_ORIGIN ?? "http://localhost:3100";
const RUNS = Number(process.env.PERF_RUNS ?? 3);

/**
 * `/` is the control — nothing about it changed, so a large delta there means
 * the run itself is noisy rather than the change being good or bad.
 */
const PAGES = [
  { key: "home", path: "/" },
  { key: "collection", path: "/tours/group-tours" },
  { key: "landing", path: "/lp/from-venice" },
  { key: "tour", path: "/tours/venice-dolomites-cortina-misurina-day-trip", afterOnly: true },
  { key: "catalog", path: "/tours", afterOnly: true },
];

const CHROME_PATH =
  process.env.CHROME_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const outDir = join(process.cwd(), "docs", "perf");
mkdirSync(outDir, { recursive: true });
const tmp = join(outDir, `.tmp-${label}.json`);

const results = {};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function runOnce(url) {
  if (existsSync(tmp)) rmSync(tmp);

  // Invoke Lighthouse's CLI entrypoint with node directly rather than through a
  // package-manager shim: `spawnSync` refuses .cmd files on Windows with EINVAL,
  // and pinning the local dependency keeps runs comparable anyway.
  //
  // The exit code is deliberately ignored. Lighthouse writes its report and
  // *then* deletes the temporary Chrome profile, which on Windows routinely
  // fails with EBUSY because the browser has not released its file handles.
  // That is a teardown problem, not a measurement problem — so the report file,
  // not the exit code, is the signal.
  spawnSync(
    process.execPath,
    [
      join(process.cwd(), "node_modules", "lighthouse", "cli", "index.js"),
      url,
      "--quiet",
      "--output=json",
      `--output-path=${tmp}`,
      "--only-categories=performance,seo,accessibility,best-practices",
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
      "--max-wait-for-load=60000",
    ],
    { stdio: ["ignore", "ignore", "ignore"], env: { ...process.env, CHROME_PATH } }
  );

  if (!existsSync(tmp)) throw new Error("Lighthouse wrote no report");

  const report = JSON.parse(readFileSync(tmp, "utf8"));
  const audit = (id) => report.audits?.[id]?.numericValue ?? 0;
  const score = (id) => Math.round((report.categories?.[id]?.score ?? 0) * 100);
  const requests = report.audits?.["network-requests"]?.details?.items ?? [];

  return {
    performance: score("performance"),
    seo: score("seo"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    lcpMs: Math.round(audit("largest-contentful-paint")),
    fcpMs: Math.round(audit("first-contentful-paint")),
    // INP needs interaction and cannot be measured in a lab run. Total Blocking
    // Time is Lighthouse's own proxy for it, so that is what is recorded rather
    // than an invented INP figure.
    tbtMs: Math.round(audit("total-blocking-time")),
    cls: audit("cumulative-layout-shift"),
    speedIndexMs: Math.round(audit("speed-index")),
    transferKb: Math.round(audit("total-byte-weight") / 1024),
    scriptKb: Math.round(
      requests
        .filter((item) => item.resourceType === "Script")
        .reduce((sum, item) => sum + (item.transferSize ?? 0), 0) / 1024
    ),
    thirdPartyKb: Math.round(
      requests
        .filter((item) => {
          try {
            return new URL(item.url).origin !== ORIGIN;
          } catch {
            return false;
          }
        })
        .reduce((sum, item) => sum + (item.transferSize ?? 0), 0) / 1024
    ),
    requestCount: requests.length,
  };
}

for (const page of PAGES) {
  if (page.afterOnly && label === "before") continue;

  const url = `${ORIGIN}${page.path}`;
  process.stdout.write(`
▸ ${label}/${page.key}  ${url}
`);

  const samples = [];
  for (let i = 0; i < RUNS; i++) {
    try {
      samples.push(runOnce(url));
      process.stdout.write(`   run ${i + 1}/${RUNS}: perf ${samples.at(-1).performance}
`);
    } catch (error) {
      process.stdout.write(`   run ${i + 1}/${RUNS} failed: ${error.message}
`);
    }
  }

  if (samples.length === 0) {
    results[page.key] = { url: page.path, error: "every Lighthouse run failed" };
    continue;
  }

  const metrics = Object.keys(samples[0]);
  const merged = { url: page.path, runs: samples.length };
  for (const metric of metrics) {
    const value = median(samples.map((s) => s[metric]));
    merged[metric] = metric === "cls" ? Number(value.toFixed(3)) : value;
  }
  // Spread of the headline metric, so a reader can judge the noise themselves.
  merged.performanceSpread = Math.max(...samples.map((s) => s.performance)) -
    Math.min(...samples.map((s) => s.performance));
  merged.lcpSpreadMs = Math.max(...samples.map((s) => s.lcpMs)) -
    Math.min(...samples.map((s) => s.lcpMs));

  results[page.key] = merged;
  console.log(
    `  median: perf ${merged.performance} (±${merged.performanceSpread})  LCP ${merged.lcpMs}ms (±${merged.lcpSpreadMs})  TBT ${merged.tbtMs}ms  CLS ${merged.cls}  3P ${merged.thirdPartyKb}kb`
  );
}

try {
  rmSync(tmp);
} catch {
  // best effort
}

const outFile = join(outDir, `${label}.json`);
writeFileSync(
  outFile,
  `${JSON.stringify({ label, origin: ORIGIN, measuredAt: new Date().toISOString(), results }, null, 2)}\n`
);
console.log(`\nWrote ${outFile}`);
