import { test, expect, type APIRequestContext } from "@playwright/test";
import { refreshSecret, readToken } from "./seo-fixture";
const headers = { Authorization: `Bearer ${refreshSecret}` };
async function change(request: APIRequestContext, operation: string) {
  expect(
    (
      await request.post("https://127.0.0.1:4451/__fixture", {
        data: { operation },
      })
    ).ok(),
  ).toBeTruthy();
}
async function sync(
  request: APIRequestContext,
  base = "http://127.0.0.1:4452",
) {
  const response = await request.post(`${base}/api/seo/connection`, {
    headers,
  });
  if (!response.ok()) return response;
  return request.get(`${base}/api/seo/connection`, { headers });
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
  await page.goto("/en/guides/planning-dolomites");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Planning a Dolomites day trip",
  );
  await expect(page).toHaveTitle("Plan a Dolomites trip | BeaVitaTours");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.beavitatours.com/en/guides/planning-dolomites",
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
  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(jsonLd["@type"]).toBe("BlogPosting");
  await expect(
    page.getByRole("link", { name: "Explore the tour", exact: true }).last(),
  ).toHaveAttribute("href", "/en/tours/dolomites");
  const raw = await (await request.get("/en/guides/planning-dolomites")).text();
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
});

test("applies approved page metadata, excludes noindex pages, and respects guide languages", async ({
  page,
  request,
}) => {
  await page.goto("/en/about");
  await expect(page).toHaveTitle("About the tour team | BeaVitaTours");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.locator('link[hreflang="it"]')).toHaveAttribute(
    "href",
    "https://www.beavitatours.com/it/about",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/en/guides/planning-dolomites</loc>");
  expect(sitemap).not.toContain("/en/about</loc>");
  expect(sitemap).toContain("/en/tours/dolomites</loc>");
  expect(sitemap).toContain("/landing</loc>");
  await page.goto("/en/guides/planning-dolomites");
  expect(await page.locator("link[hreflang]").count()).toBe(0);
  expect(
    (await request.get("/en/guides/planning-dolomites")).headers()["link"] ||
      "",
  ).not.toContain("hreflang");
  expect((await request.get("/it/guides/planning-dolomites")).status()).toBe(
    404,
  );
  expect((await request.get("/ja/guides")).status()).toBe(404);
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
    await (await request.get("/en/guides/planning-dolomites")).text(),
  ).toContain("Updated published guide");
  await change(request, "withdraw");
  expect((await sync(request)).ok()).toBeTruthy();
  expect((await request.get("/en/guides/planning-dolomites")).status()).toBe(
    404,
  );
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "/guides",
  );
  expect(await (await request.get("/en")).text()).not.toContain(
    'href="/en/guides"',
  );
});

test("keeps the last valid snapshot through a failed refresh and recovers", async ({
  request,
}) => {
  await change(request, "fail");
  expect((await sync(request)).status()).toBe(503);
  const page = await request.get("/en/guides/planning-dolomites");
  expect(page.status()).toBe(200);
  expect(await page.text()).toContain("Planning a Dolomites day trip");
  await change(request, "recover");
  expect((await sync(request)).ok()).toBeTruthy();
});

test("preview is noindex and disabled mode keeps the existing website available", async ({
  request,
}) => {
  const preview = "http://127.0.0.1:4453",
    disabled = "http://127.0.0.1:4454";
  expect((await sync(request, preview)).ok()).toBeTruthy();
  const html = await (
    await request.get(`${preview}/en/guides/planning-dolomites`)
  ).text();
  expect(html).toContain('content="noindex, nofollow"');
  expect(await (await request.get(`${preview}/robots.txt`)).text()).toContain(
    "Disallow: /",
  );
  expect(
    await (await request.get(`${preview}/sitemap.xml`)).text(),
  ).not.toContain("<loc>");
  expect((await request.get(`${disabled}/en`)).status()).toBe(200);
  expect(
    (await request.get(`${disabled}/en/guides/planning-dolomites`)).status(),
  ).toBe(404);
  expect(
    (await request.get(`${disabled}/api/seo/connection`, { headers })).status(),
  ).toBe(404);
});
