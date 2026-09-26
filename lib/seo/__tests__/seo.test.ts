import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import { snapshotSchema } from "../contract";
import { fetchSnapshot } from "../transport";
import { seoConfig } from "../config";
import { pageMetadata } from "../metadata";
import { findPage } from "../publications";
import { toSitePath } from "../routes";
import {
  sampleSnapshot,
  rehash,
  readToken,
  refreshSecret,
  fixtureSite,
} from "./fixture";

describe("website publication contract", () => {
  it("requires explicit activation and independent server credentials", () => {
    expect(seoConfig({})).toBeNull();
    const env = {
      SEO_DELIVERY_MODE: "live",
      SEO_STUDIO_URL: "https://seo.example.test",
      SEO_STUDIO_READ_TOKEN: readToken,
      SEO_REFRESH_SECRET: refreshSecret,
    };
    expect(seoConfig(env)?.mode).toBe("live");
    for (const change of [
      { SEO_STUDIO_READ_TOKEN: "" },
      { SEO_REFRESH_SECRET: readToken },
      { SEO_STUDIO_URL: "http://outside.example" },
      { VERCEL_ENV: "preview" },
    ])
      expect(() => seoConfig({ ...env, ...change })).toThrow();
  });

  it("accepts versioned publications and rejects private fields, invalid origins, unsupported routes and mismatched hashes", () => {
    expect(snapshotSchema.parse(sampleSnapshot()).articles).toHaveLength(1);
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
      expect(snapshotSchema.safeParse(snapshot).success).toBe(false);
    }
    const modified = sampleSnapshot();
    modified.articles[0].title = "Unexpected modification";
    expect(snapshotSchema.safeParse(modified).success).toBe(false);
  });

  it("also accepts publications addressed to the English-only site", () => {
    const snapshot = sampleSnapshot();
    snapshot.articles[0].canonical = `${fixtureSite}/guides/planning-dolomites`;
    snapshot.articles[0].tourPath = "/tours/dolomites";
    snapshot.pages[0] = {
      ...snapshot.pages[0],
      path: "/about",
      canonical: `${fixtureSite}/about`,
      alternates: [{ language: "en", path: "/about" }],
    };
    expect(snapshotSchema.safeParse(rehash(snapshot)).success).toBe(true);

    // An unprefixed path is English, so it cannot be the Italian alternate.
    snapshot.pages[0].alternates = [{ language: "it", path: "/about" }];
    expect(snapshotSchema.safeParse(rehash(snapshot)).success).toBe(false);
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
      await expect(
        fetchSnapshot(config, (async () => response) as typeof fetch),
      ).rejects.toThrow();
    }
    const result = await fetchSnapshot(config, (async (url, options) => {
      expect(url).toBe("https://seo.example.test/api/website/content");
      expect(options?.redirect).toBe("error");
      expect(new Headers(options?.headers).get("authorization")).toBe(
        `Bearer ${readToken}`,
      );
      return Response.json(sampleSnapshot());
    }) as typeof fetch);
    expect(result.articles[0].version).toBe(1);
  });

  it("accepts cover photos and older text-only articles while rejecting unsafe or incomplete images", () => {
    const withPhoto = sampleSnapshot();
    expect(snapshotSchema.parse(withPhoto).articles[0].coverImage?.alt).toBe(
      withPhoto.articles[0].coverImage?.alt,
    );
    const legacy = sampleSnapshot();
    delete legacy.articles[0].coverImage;
    rehash(legacy);
    expect(snapshotSchema.parse(legacy).articles[0].coverImage).toBeUndefined();
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
      expect(snapshotSchema.safeParse(invalid).success).toBe(false);
    }
  });
});

describe("English-only site mapping", () => {
  it("maps English legacy paths onto this site and drops other languages", () => {
    expect(toSitePath("/en")).toBe("/");
    expect(toSitePath("/en/about")).toBe("/about");
    expect(toSitePath("/en/tours/shared-tours")).toBe("/tours/group-tours");
    expect(toSitePath("/en/rates")).toBe("/tours/private-tours");
    expect(toSitePath("/en/tours/prosecco")).toBe("/tours/prosecco");
    expect(toSitePath("/it/about")).toBeNull();
    expect(toSitePath("/ja")).toBeNull();
    expect(toSitePath("/tours/cultural")).toBe("/tours/cultural");
  });

  it("prefers a page published under the site's own path over a legacy one", () => {
    const snapshot = sampleSnapshot();
    snapshot.pages.push({
      ...snapshot.pages[0],
      path: "/about",
      title: "Current about title",
      canonical: `${fixtureSite}/about`,
      alternates: [],
    });
    expect(findPage(snapshot, "/about")?.title).toBe("Current about title");
    expect(findPage(sampleSnapshot(), "/about")).toMatchObject({
      canonical: `${fixtureSite}/about`,
      indexable: false,
      follow: true,
    });
    expect(findPage(sampleSnapshot(), "/contact")).toBeNull();
  });
});

describe("delivery modes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const serve = (mode: "live" | "preview") => {
    vi.stubEnv("SEO_DELIVERY_MODE", mode);
    vi.stubEnv("SEO_STUDIO_URL", "https://seo.example.test");
    vi.stubEnv("SEO_STUDIO_READ_TOKEN", readToken);
    vi.stubEnv("SEO_REFRESH_SECRET", refreshSecret);
    vi.stubEnv("VERCEL_ENV", mode === "live" ? "production" : "preview");
    vi.stubGlobal("fetch", async () => Response.json(sampleSnapshot(mode)));
  };
  const fallback = { title: "About", alternates: { canonical: "/about" } };

  it("live: applies approved page metadata over the page's own", async () => {
    serve("live");
    expect(await pageMetadata("/about", fallback)).toMatchObject({
      title: "About the tour team | BeaVitaTours",
      alternates: { canonical: `${fixtureSite}/about` },
      robots: { index: false, follow: true },
    });
    expect(robots().rules).toMatchObject({ allow: "/" });
  });

  it("preview: nothing is indexed or crawled", async () => {
    serve("preview");
    expect((await pageMetadata("/faq", fallback)).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("off, or SEO Workspace unreachable: pages keep their own metadata", async () => {
    vi.stubEnv("SEO_DELIVERY_MODE", "off");
    expect(await pageMetadata("/about", fallback)).toEqual(fallback);

    serve("live");
    vi.stubGlobal("fetch", async () => new Response("down", { status: 503 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await pageMetadata("/about", fallback)).toEqual(fallback);
  });

  it("live settings on a preview deployment: pages fall back instead of throwing", async () => {
    serve("live");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await pageMetadata("/about", fallback)).toEqual({
      ...fallback,
      robots: { index: false, follow: false },
    });
  });
});
