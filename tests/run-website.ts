// Run everything locally, without loading .env or calling real providers.
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:https";
import {
  sampleSnapshot,
  rehash,
  readToken,
  previewReadToken,
  refreshSecret,
} from "./seo-fixture";

async function main() {
  const directory = await mkdtemp(join(tmpdir(), "beavita-connector-test-"));
  const key = join(directory, "key.pem"),
    cert = join(directory, "cert.pem");
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-days",
      "1",
      "-keyout",
      key,
      "-out",
      cert,
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1",
    ],
    { stdio: "ignore" },
  );
  let snapshot = sampleSnapshot(),
    failed = false;
  const fixture = createServer(
    { key: await readFile(key), cert: await readFile(cert) },
    async (request, response) => {
      response.setHeader("content-type", "application/json");
      if (request.url === "/__fixture" && request.method === "POST") {
        let body = "";
        for await (const chunk of request) body += chunk;
        const operation = JSON.parse(body).operation;
        if (operation === "reset") {
          snapshot = sampleSnapshot();
          failed = false;
        }
        if (operation === "withdraw") {
          snapshot.articles = [];
          rehash(snapshot);
        }
        if (operation === "publish") {
          snapshot.articles[0].title = "Updated published guide";
          snapshot.articles[0].version++;
          rehash(snapshot);
        }
        if (operation === "fail") failed = true;
        if (operation === "recover") failed = false;
        response.end(JSON.stringify({ ok: true }));
        return;
      }
      if (failed) {
        response.writeHead(503);
        response.end("{}");
        return;
      }
      if (request.url !== "/api/website/content") {
        response.writeHead(404);
        response.end("{}");
        return;
      }
      const token = request.headers.authorization;
      if (
        token !== `Bearer ${readToken}` &&
        token !== `Bearer ${previewReadToken}`
      ) {
        response.writeHead(401);
        response.end("{}");
        return;
      }
      response.end(
        JSON.stringify({
          ...snapshot,
          mode: token === `Bearer ${previewReadToken}` ? "preview" : "live",
        }),
      );
    },
  );
  await new Promise<void>((resolve) =>
    fixture.listen(4451, "127.0.0.1", resolve),
  );
  const children = (["live", "preview", "off"] as const).map((mode, index) =>
    spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(4452 + index),
      ],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          NODE_ENV: "production",
          NODE_EXTRA_CA_CERTS: cert,
          SEO_DELIVERY_MODE: mode,
          SEO_STUDIO_URL: "https://127.0.0.1:4451",
          SEO_STUDIO_READ_TOKEN:
            mode === "preview" ? previewReadToken : readToken,
          SEO_REFRESH_SECRET: refreshSecret,
          RESEND_API_KEY: "re_local_build_placeholder",
          VERCEL_ENV: mode === "preview" ? "preview" : "production",
        },
      },
    ),
  );
  let closing = false;
  async function close() {
    if (closing) return;
    closing = true;
    children.forEach((child) => child.kill("SIGTERM"));
    fixture.closeAllConnections();
    fixture.close();
    await rm(directory, { recursive: true, force: true });
  }
  process.on("SIGTERM", () => void close());
  process.on("SIGINT", () => void close());
  for (const child of children)
    child.on("exit", (code) => {
      if (!closing) {
        process.exitCode = code || 1;
        void close();
      }
    });
}
void main();
