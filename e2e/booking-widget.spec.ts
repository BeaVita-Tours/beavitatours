import { expect, type Page, test } from "@playwright/test";

/**
 * Regiondo's hosted booking widget in the tour page's booking box, and the
 * fallback to the API panel when it does not load.
 *
 * Regiondo's real loader is swapped for a stand-in that defines the same
 * `<booking-widget>` element. The real one needs Regiondo's booking backend,
 * which a test must not depend on (and which we must not book against). What
 * is under test is ours: which widget the page asks for, the frame, its
 * height, and the hand-over to the API panel.
 */

const TOUR = "/tours/venice-dolomites-cortina-misurina-day-trip";
const LOADER = "https://widgets.regiondo.net/booking/v1/booking-widget.min.js";

/** A stand-in for Regiondo's loader that renders `body` into the widget. */
function fakeLoader(body: string, height = 720) {
  return `customElements.define("booking-widget", class extends HTMLElement {
    connectedCallback() {
      const root = this.attachShadow({ mode: "open" });
      const attrs = ["widget-id"]
        .map((name) => name + "=" + (this.getAttribute(name) || ""))
        .join(" ");
      root.innerHTML = '<div style="height:${height}px"><p class="attrs">' + attrs + '</p>${body}</div>';
    }
  });`;
}

async function serveLoader(page: Page, script: string) {
  await page.route(LOADER, (route) =>
    route.fulfill({ contentType: "text/javascript", body: script })
  );
}

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([
    {
      name: "beavita_cookie_consent",
      value: encodeURIComponent(
        JSON.stringify({
          version: "1",
          action: "accept-all",
          timestamp: new Date().toISOString(),
          preferences: { necessary: true, analytics: true, marketing: true },
        })
      ),
      domain: "localhost",
      path: "/",
    },
  ]);
});

const WIDGET_ID = "0b1e2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

test("the booking box is the tour's dashboard Booking widget", async ({ page }) => {
  await serveLoader(page, fakeLoader("<button>Pick a date</button>"));
  await page.goto(TOUR);

  const box = page.locator('[data-booking-widget="ready"]');
  await expect(box).toBeVisible({ timeout: 20_000 });

  // The mock lists a Booking widget and a newer Button widget for this
  // product; only the Booking one may be used.
  const frame = box.locator("iframe");
  await expect(frame).toHaveAttribute("src", `/embed/regiondo-booking?widget=${WIDGET_ID}`);
  const widget = page.frameLocator("[data-booking-widget] iframe");
  await expect(widget.locator("booking-widget")).toHaveAttribute("widget-id", WIDGET_ID);

  // The frame takes the widget's height instead of scrolling inside itself.
  await expect
    .poll(async () => (await frame.boundingBox())?.height ?? 0, { timeout: 10_000 })
    .toBeGreaterThanOrEqual(720);

  // And the API panel is not there: no live API calls while the widget works.
  await expect(page.getByRole("button", { name: /reserve your places/i })).toHaveCount(0);

  // The rest of the page is still ours.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /about this tour/i })).toBeVisible();
});

test("falls back to the API panel when the widget script cannot load", async ({ page }) => {
  await page.route(LOADER, (route) => route.abort());
  await page.goto(TOUR);

  await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
    timeout: 20_000,
  });
  await expect(page.locator("[data-booking-widget] iframe")).toHaveCount(0);
});

for (const [label, screen] of [
  ["Network Error", "<p>Network Error</p>"],
  [
    "Unable to load",
    "<h2>Unable to load</h2><p>It seems that the server is unreachable.</p><button>reload page</button>",
  ],
] as const) {
  test(`falls back when the widget shows "${label}"`, async ({ page }) => {
    // Regiondo's own error screens, verbatim from its bundle.
    await serveLoader(page, fakeLoader(screen, 120));
    await page.goto(TOUR);

    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });
  });
}

test("the embed page refuses anything but a well-formed widget", async ({ page }) => {
  const ok = await page.request.get(`/embed/regiondo-booking?widget=${WIDGET_ID}`);
  expect(ok.status()).toBe(200);
  expect(ok.headers()["x-robots-tag"]).toMatch(/noindex/);
  expect(ok.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");

  for (const query of [
    "",
    "widget=%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E",
    "provider=BE116&product=298190",
  ]) {
    const response = await page.request.get(`/embed/regiondo-booking?${query}`);
    expect(response.status(), query).toBe(400);
  }
});
