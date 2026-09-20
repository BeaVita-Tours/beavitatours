import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { snapshotSchema } from "../lib/seo/contract";
import { fetchSnapshot } from "../lib/seo/transport";
import { seoConfig } from "../lib/seo/config";
import {
  sampleSnapshot,
  rehash,
  readToken,
  refreshSecret,
} from "./seo-fixture";

describe("website publication contract", () => {
  it("requires explicit activation and independent server credentials", () => {
    assert.equal(seoConfig({}), null);
    const env = {
      SEO_DELIVERY_MODE: "live",
      SEO_STUDIO_URL: "https://seo.example.test",
      SEO_STUDIO_READ_TOKEN: readToken,
      SEO_REFRESH_SECRET: refreshSecret,
    };
    assert.equal(seoConfig(env)?.mode, "live");
    for (const change of [
      { SEO_STUDIO_READ_TOKEN: "" },
      { SEO_REFRESH_SECRET: readToken },
      { SEO_STUDIO_URL: "http://outside.example" },
      { VERCEL_ENV: "preview" },
    ])
      assert.throws(() => seoConfig({ ...env, ...change }));
  });
  it("accepts versioned publications and rejects private fields, invalid origins, unsupported routes and mismatched hashes", () => {
    assert.equal(snapshotSchema.parse(sampleSnapshot()).articles.length, 1);
    for (const mutate of [
      (s: ReturnType<typeof sampleSnapshot>) => {
        s.articles[0].canonical = "https://attacker.example/";
      },
      (s: ReturnType<typeof sampleSnapshot>) => {
        s.articles[0].tourPath = "/en/missing";
      },
      (s: ReturnType<typeof sampleSnapshot>) => {
        s.pages[0].alternates.push({ language: "en", path: "/it/about" });
      },
      (s: ReturnType<typeof sampleSnapshot>) => {
        s.articles.push(s.articles[0]);
      },
      (s: ReturnType<typeof sampleSnapshot>) => {
        Object.assign(s.articles[0], { brief: "Private editorial brief" });
      },
    ]) {
      const snapshot = sampleSnapshot();
      mutate(snapshot);
      rehash(snapshot);
      assert.equal(snapshotSchema.safeParse(snapshot).success, false);
    }
    const modified = sampleSnapshot();
    modified.articles[0].title = "Unexpected modification";
    assert.equal(snapshotSchema.safeParse(modified).success, false);
  });
  it("never turns transport failures or invalid payloads into a valid empty publication", async () => {
    const config = {
      mode: "live" as const,
      studioUrl: "https://seo.example.test",
      readToken,
      refreshSecret,
    };
    for (const response of [
      new Response("offline", { status: 503 }),
      Response.json({ articles: [] }),
      Response.json(sampleSnapshot("preview")),
      new Response("x".repeat(8_000_001), {
        headers: { "content-type": "application/json" },
      }),
    ]) {
      await assert.rejects(
        fetchSnapshot(config, (async () => response) as typeof fetch),
      );
    }
    const result = await fetchSnapshot(config, (async (url, options) => {
      assert.equal(url, "https://seo.example.test/api/website/content");
      assert.equal(options?.redirect, "error");
      assert.equal(
        new Headers(options?.headers).get("authorization"),
        `Bearer ${readToken}`,
      );
      return Response.json(sampleSnapshot());
    }) as typeof fetch);
    assert.equal(result.articles[0].version, 1);
  });
  it("accepts cover photos and older text-only articles while rejecting unsafe or incomplete images", () => {
    const withPhoto = sampleSnapshot();
    assert.equal(
      snapshotSchema.parse(withPhoto).articles[0].coverImage?.alt,
      withPhoto.articles[0].coverImage?.alt,
    );
    const legacy = sampleSnapshot();
    delete legacy.articles[0].coverImage;
    rehash(legacy);
    assert.equal(
      snapshotSchema.parse(legacy).articles[0].coverImage,
      undefined,
    );
    for (const image of [
      { url: "javascript:alert(1)", alt: "Photo" },
      { url: "https://user:secret@example.com/photo.jpg", alt: "Photo" },
      { url: "http://example.com/photo.jpg", alt: "Photo" },
      { url: "https://example.com/photo.jpg", alt: "" },
      { url: "/api/media/local.webp", alt: "Photo" },
      {
        url: "https://example.com/photo.jpg",
        alt: "Photo",
        privateNote: "private",
      },
    ]) {
      const invalid = sampleSnapshot();
      invalid.articles[0].coverImage = image;
      rehash(invalid);
      assert.equal(snapshotSchema.safeParse(invalid).success, false);
    }
  });
});
