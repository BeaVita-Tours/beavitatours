import { test, expect, type APIRequestContext } from "@playwright/test";
import { refreshSecret, readToken } from "../lib/seo/__tests__/fixture";

/**
 * SEO Workspace connector, end to end, against e2e/mock-seo-workspace.mjs in
 * live mode (see playwright.config.ts). The mock publishes in the Workspace's
 * current shape (www origin, /en/... paths), so these also cover the mapping
 * onto the English-only site. Preview and off modes are covered by the unit
 * tests in lib/seo/__tests__.
 */

const workspace = "http://localhost:4011";
const headers = { Authorization: `Bearer ${refreshSecret}` };
const guideAlt = "Rocky Dolomite peaks above the Lagazuoi cable-car station";

async function change(request: APIRequestContext, operation: string) {
  expect(
    (await request.post(`${workspace}/__fixture`, { data: { operation } })).ok(),
  ).toBeTruthy();
}
async function sync(request: APIRequestContext) {
  const response = await request.post("/api/seo/connection", { headers });
  if (!response.ok()) return response;
  return request.get("/api/seo/connection", { headers });
}
test.beforeEach(async ({ request, context }) => {
  await change(request, "reset");
  expect((await sync(request)).ok()).toBeTruthy();
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname)
      ? route.continue()
      : route.abort();
  });
});

test("serves published HTML, safe markdown, canonical metadata and a real tour link", async ({
  page,
  request,
}) => {
  await page.goto("/guides/planning-dolomites");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Planning a Dolomites day trip",
  );
  await expect(page).toHaveTitle("Plan a Dolomites trip | BeaVitaTours");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.beavitatours.com/guides/planning-dolomites",
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { articleAttack?: boolean }).articleAttack,
    ),
  ).toBeUndefined();
  expect(
    await page
      .locator('a[href^="javascript:"],img[src*="untrusted.example"]')
      .count(),
  ).toBe(0);
  // The site layout adds its own TravelAgency block; take the article's.
  const jsonLd = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  )
    .map((text) => JSON.parse(text))
    .find((data) => data["@type"] === "BlogPosting");
  expect(jsonLd["@type"]).toBe("BlogPosting");
  expect(jsonLd.image).toBe(
    "https://www.beavitatours.com/imgs/dolomites/dolomitesmain.jpeg",
  );
  const cover = page.getByRole("img", { name: guideAlt });
  await expect(cover).toBeVisible();
  await expect
    .poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    jsonLd.image,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  // The in-body link keeps its published (legacy) path, which redirects; the
  // tour button is mapped onto this site.
  await expect(
    page.getByRole("link", { name: "Explore the tour", exact: true }).last(),
  ).toHaveAttribute("href", "/tours/dolomites");
  const raw = await (await request.get("/guides/planning-dolomites")).text();
  expect(raw).toContain("Before your trip");
  expect(raw).not.toContain(readToken);
  expect(raw).not.toContain(refreshSecret);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/guide-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/guide-desktop.png",
    fullPage: true,
  });
  await page.goto("/guides");
  await expect(page.locator(`img[alt="${guideAlt}"]`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Guides" }).first()).toBeAttached();
});

test("applies approved page metadata, excludes noindex pages, and serves English only", async ({
  page,
  request,
}) => {
  await page.goto("/about");
  await expect(page).toHaveTitle("About the tour team | BeaVitaTours");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  expect(await page.locator("link[hreflang]").count()).toBe(0);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/guides/planning-dolomites</loc>");
  expect(sitemap).not.toContain("/about</loc>");
  expect(sitemap).toContain("/tours/dolomites</loc>");
  await page.goto("/guides/planning-dolomites");
  expect(await page.locator("link[hreflang]").count()).toBe(0);
  // Old localized guide URLs redirect to the English guide.
  const legacy = await request.get("/en/guides/planning-dolomites", {
    maxRedirects: 0,
  });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toBe("/guides/planning-dolomites");
  expect((await request.get("/guides/not-published")).status()).toBe(404);
});

test("refreshes publications and withdrawals without exposing other server capabilities", async ({
  request,
}) => {
  expect((await request.post("/api/seo/connection")).status()).toBe(401);
  expect(
    (
      await request.post("/api/seo/connection", {
        headers: { Authorization: `Bearer ${readToken}` },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/seo/connection", {
        headers: { ...headers, Origin: "https://attacker.example" },
      })
    ).status(),
  ).toBe(403);
  await change(request, "publish");
  expect((await sync(request)).ok()).toBeTruthy();
  expect(
    await (await request.get("/guides/planning-dolomites")).text(),
  ).toContain("Updated published guide");
  await change(request, "withdraw");
  expect((await sync(request)).ok()).toBeTruthy();
  expect((await request.get("/guides/planning-dolomites")).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "/guides",
  );
  expect(await (await request.get("/")).text()).not.toContain(
    'href="/guides"',
  );
});

test("keeps the last valid snapshot through a failed refresh and recovers", async ({
  request,
}) => {
  await change(request, "fail");
  expect((await sync(request)).status()).toBe(503);
  const page = await request.get("/guides/planning-dolomites");
  expect(page.status()).toBe(200);
  expect(await page.text()).toContain("Planning a Dolomites day trip");
  await change(request, "recover");
  expect((await sync(request)).ok()).toBeTruthy();
});
