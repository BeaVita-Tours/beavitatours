#!/usr/bin/env node
/**
 * Fail the build if any secret from .env.local appears in the client bundle.
 *
 * The Regiondo private key is an HMAC signing secret. `import "server-only"`
 * makes an accidental client import a build error, but that guard only covers
 * imports — it would not catch a value inlined into a client component by hand,
 * or a NEXT_PUBLIC_ prefix added in a hurry. This checks the artefact itself.
 *
 *     node scripts/check-no-secrets.mjs
 *
 * Scans .next/static and .next/server/app for the literal value of every
 * server-only secret. Prints variable names only, never values.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * Variables whose values must never reach a bundle. NEXT_PUBLIC_* are exempt by
 * definition; anything else in .env.local is treated as a secret unless it is
 * on the allowlist below.
 */
const NOT_SECRET = new Set([
  "REGIONDO_API_ENV",
  "REGIONDO_VENDOR_ID",
  "REGIONDO_DEFAULT_LOCALE",
  "REGIONDO_CURRENCY",
  "REGIONDO_WIDGET_OFFER_IDS",
  "REGIONDO_PAYMENT_MODE",
  "REGIONDO_NATIVE_BOOKING",
  "GOOGLE_PLACES_QUERY",
  "GOOGLE_PLACE_ID",
]);

function loadSecrets() {
  let raw;
  try {
    raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  } catch {
    console.log("check-no-secrets: no .env.local, nothing to check");
    return [];
  }

  const secrets = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const name = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!value || value.length < 8) continue;
    if (name.startsWith("NEXT_PUBLIC_") || NOT_SECRET.has(name)) continue;
    secrets.push({ name, value });
  }
  return secrets;
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) yield* walk(path);
    else if (/\.(js|mjs|cjs|json|html|txt|map|rsc)$/.test(entry)) yield path;
  }
}

const secrets = loadSecrets();
if (secrets.length === 0) process.exit(0);

// .next/static is what the browser downloads. .next/server is included because
// a secret baked into a prerendered payload would be served to the client too.
const targets = [join(ROOT, ".next", "static"), join(ROOT, ".next", "server", "app")];

const findings = [];
let scanned = 0;

for (const target of targets) {
  for (const file of walk(target)) {
    scanned++;
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const secret of secrets) {
      if (content.includes(secret.value)) {
        findings.push({ name: secret.name, file: file.replace(ROOT, "") });
      }
    }
  }
}

if (findings.length > 0) {
  console.error(`\ncheck-no-secrets: FAILED — ${findings.length} leak(s) in the build output:\n`);
  for (const finding of findings) console.error(`  ${finding.name} -> ${finding.file}`);
  console.error("\nA server-only value reached the bundle. Do not deploy this build.\n");
  process.exit(1);
}

console.log(
  `check-no-secrets: OK — ${secrets.length} secret(s) checked against ${scanned} build files, none present`
);
