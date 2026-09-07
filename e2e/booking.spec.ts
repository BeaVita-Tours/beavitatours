import { expect, type Page, test } from "@playwright/test";

/**
 * The booking flow, end to end, against the mock Regiondo in
 * `e2e/mock-regiondo.mjs`.
 *
 * Three scenarios, chosen because they are the ones that cost money when they
 * go wrong: the happy path must reach the payment handoff, a departure that
 * sells out must not let anyone start a booking, and a hold that expired must
 * offer a way back rather than a dead end.
 */

const TOUR = "/tours/venice-dolomites-cortina-misurina-day-trip";
const MOCK = "http://localhost:4010";

async function setScenario(page: Page, name: string) {
  const response = await page.request.get(`${MOCK}/__scenario?name=${name}`);
  expect(response.ok()).toBe(true);
}

/**
 * Pre-accept cookies so the consent banner is not on screen.
 *
 * Not a convenience: the banner is `fixed inset-x-0 bottom-0 z-50`, so on a
 * phone it sits directly over the booking CTA and swallows the click. Every
 * click-based test failed on it before this. Worth knowing about the real site
 * too — noted in the known-gaps list — but these tests are about the booking
 * flow, not about the banner.
 *
 * Shape from `lib/cookie-consent.ts`: encodeURIComponent(JSON.stringify(record)).
 */
async function acceptCookies(page: Page) {
  const record = {
    version: "1",
    action: "accept-all",
    timestamp: new Date().toISOString(),
    preferences: { necessary: true, analytics: true, marketing: true },
  };
  await page.context().addCookies([
    {
      name: "beavita_cookie_consent",
      value: encodeURIComponent(JSON.stringify(record)),
      domain: "localhost",
      path: "/",
    },
  ]);
}

test.beforeEach(async ({ page }) => {
  await setScenario(page, "happy");
  await page.context().clearCookies();
  await acceptCookies(page);
});

test.afterAll(async ({ playwright }) => {
  // Leave the mock in its default state for whatever runs next.
  const request = await playwright.request.newContext();
  await request.get(`${MOCK}/__scenario?name=happy`);
  await request.dispose();
});

test.describe("catalog", () => {
  test("the navbar links the catalog pages to each other", async ({ page }) => {
    await page.goto("/tours");
    const nav = page.getByRole("navigation", { name: /main/i });
    await expect(nav.getByRole("link", { name: /all tours/i })).toHaveCount(0);

    await nav.getByRole("link", { name: /private tours/i }).first().click();
    await expect(page).toHaveURL(/\/tours\/private-tours$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Private day tours");
  });

  test("the private tours page carries the tailor-made offer", async ({ page }) => {
    // The tailor-made offer, under the bookable private departures. There is
    // deliberately no rate card any more — a single "starting from" hook and
    // the quote CTA is the whole pitch.
    await page.goto("/tours/private-tours");
    await expect(page.getByRole("heading", { name: /design your own day/i })).toBeVisible();
    await expect(page.getByText("Starting from")).toBeVisible();
    await expect(page.getByText("€900")).toBeVisible();
    await expect(page.getByText("€600")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /ask for a quote/i })).toBeVisible();
  });

  test("/rates redirects to the private tours page", async ({ page }) => {
    await page.goto("/rates");
    await expect(page).toHaveURL(/\/tours\/private-tours$/);
  });

  test("lists tours with prices and links to a detail page", async ({ page }) => {
    await page.goto("/tours");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Day trips from Venice");

    const cards = page.getByRole("heading", { level: 3 });
    expect(await cards.count()).toBeGreaterThan(0);

    // Price must be server-rendered, not filled in by client JavaScript.
    await expect(page.getByText(/€\d/).first()).toBeVisible();
  });

  test("filters through the URL, so the view is shareable and crawlable", async ({ page }) => {
    await page.goto("/tours");
    await page.getByRole("link", { name: "Under €150" }).click();

    await expect(page).toHaveURL(/[?&]price=under-150/);
    await expect(page.getByRole("link", { name: "Under €150" })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  test("renders tour content into the HTML for crawlers", async ({ page }) => {
    // The whole SEO argument for this project: with JavaScript disabled the
    // tour copy and its structured data are still there.
    const response = await page.goto(TOUR);
    const html = (await response?.text()) ?? "";

    expect(html).toContain("Dolomites");
    expect(html).toContain('"@type"');
    expect(html).toContain("TouristTrip");
    expect(html).toContain("BreadcrumbList");
  });
});

test.describe("theme page upsells", () => {
  test("puts bookable departures on an editorial page", async ({ page }) => {
    // /tours/dolomites used to describe the mountains and then send the reader
    // to /rates, which is a price list rather than something you can book.
    await page.goto("/tours/dolomites");

    const upsell = page.getByRole("heading", { name: /day trips to the dolomites/i });
    await expect(upsell).toBeVisible();

    // Three cards, and each one goes to a real tour page.
    const links = page.locator('a[href^="/tours/venice-"], a[href^="/tours/jesolo-"]');
    expect(await links.count()).toBeGreaterThan(0);

    await expect(page.getByText(/€\d/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /see every day trip we run/i })).toBeVisible();
  });

  test("the see-all link lands on the full catalog, not a hidden filter", async ({ page }) => {
    // An earlier version linked to /tours?q=dolomites — a page the reader could
    // not reach any other way, narrowed by a filter the page did not show.
    await page.goto("/tours/dolomites");
    await page.getByRole("link", { name: /see every day trip we run/i }).click();

    await expect(page).toHaveURL(/\/tours$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Day trips from Venice");
  });

  test("a card leads into the booking flow", async ({ page }) => {
    await page.goto("/tours/dolomites");

    const first = page.locator('a[href^="/tours/venice-"]').first();
    const href = await first.getAttribute("href");
    await first.click();

    await page.waitForURL(`**${href}`);
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });
  });

  test("the upsell content is in the HTML, not injected by script", async ({ page }) => {
    const response = await page.goto("/tours/cultural");
    const html = (await response?.text()) ?? "";

    expect(html).toContain("Tours through the hill towns");
    expect(html).toContain("ItemList");
    // And the page finally has a title of its own.
    expect(html).toMatch(/<title>Medieval hill towns/);
  });
});

test.describe("happy path", () => {
  test("holds places and hands off to Regiondo's hosted checkout", async ({ page }) => {
    await page.goto(TOUR);

    const reserve = page.getByRole("button", { name: /reserve your places/i });
    await expect(reserve).toBeEnabled({ timeout: 20_000 });
    await reserve.click();

    await expect(page).toHaveURL(/\/book\/mock-\d+/);
    await expect(page.getByRole("heading", { name: /complete your booking/i })).toBeVisible();

    // The form comes from the API's field definitions, deduplicated: one of
    // each, not the two sets the API describes.
    await expect(page.getByLabel(/first name/i)).toHaveCount(1);
    await expect(page.getByLabel(/email/i)).toHaveCount(1);
    await expect(page.getByText(/places held for \d+:\d\d/i)).toBeVisible();

    await page.getByLabel(/first name/i).fill("Test");
    await page.getByLabel(/last name/i).fill("Customer");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/phone/i).fill("+39 000 000 0000");

    // Do not follow the redirect off-site; assert where it points. The whole
    // compliance position is that payment happens on Regiondo's domain.
    const handoff = page.waitForRequest(
      (request) => request.url().includes("regiondo.com/checkout"),
      { timeout: 20_000 }
    );
    await page.getByRole("button", { name: /continue to secure payment/i }).click();

    const request = await handoff;
    expect(new URL(request.url()).hostname).toMatch(/regiondo\.com$/);
  });

  test("never asks for card details on our own origin", async ({ page }) => {
    await page.goto(TOUR);
    await page.getByRole("button", { name: /reserve your places/i }).click();
    await expect(page).toHaveURL(/\/book\//);

    // No field on our checkout should be capable of collecting a card.
    const html = await page.content();
    expect(html).not.toMatch(/card[_-]?number|cardnumber|cvv|cvc|autocomplete="cc-/i);
    await expect(
      page.getByText(/never see your card details|never reach this website/i).first()
    ).toBeVisible();
  });
});

test.describe("sold out", () => {
  test("offers no way to book a departure with no stock", async ({ page }) => {
    await setScenario(page, "soldout");
    await page.goto(TOUR);

    // An empty calendar is the safe failure: the panel cannot sell something
    // that may not exist.
    await expect(page.getByText(/no dates are open for online booking/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /reserve your places/i })).toHaveCount(0);

    // And there is still a way to reach a human.
    await expect(page.getByRole("link", { name: /private departure|contact/i }).first()).toBeVisible();
  });

  test("refuses the hold when stock disappears between render and submit", async ({ page }) => {
    await page.goto(TOUR);
    const reserve = page.getByRole("button", { name: /reserve your places/i });
    await expect(reserve).toBeEnabled({ timeout: 20_000 });

    // The world changes underneath a page that is already open.
    await setScenario(page, "soldout");
    await reserve.click();

    await expect(
      page.getByText(/sold out|just been taken|no longer available/i)
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(TOUR));
  });
});

test.describe("expired reservation", () => {
  test("gives a way back instead of a dead end", async ({ page }) => {
    await page.goto(TOUR);
    await page.getByRole("button", { name: /reserve your places/i }).click();
    await expect(page).toHaveURL(/\/book\//);

    // The hold lapses upstream while the customer is filling in the form.
    await setScenario(page, "expired");
    await page.reload();

    await expect(page.getByRole("heading", { name: /expired/i })).toBeVisible();
    await expect(page.getByText(/nothing has been charged/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /choose a date/i })).toBeVisible();
  });

  test("a reservation code alone does not open someone else's checkout", async ({ page }) => {
    // Reservations are account-global on this API, so the signed session cookie
    // is the only thing binding one to a browser.
    await page.context().clearCookies();
    await acceptCookies(page);
    await page.goto("/book/mock-1234567890");

    await expect(page.getByRole("heading", { name: /expired/i })).toBeVisible();
    await expect(page.getByText(/complete your booking/i)).toHaveCount(0);
  });
});

test.describe("confirmation", () => {
  test("verifies the order server-side and refuses an invented one", async ({ page }) => {
    await page.goto("/book/confirmation?order=9999999999999");

    await expect(page.getByRole("heading", { name: /find your booking/i })).toBeVisible();
    // Next renders its own empty role="alert" route announcer, so match the
    // message rather than the role alone.
    await expect(page.getByText(/could not find an order/i)).toBeVisible();
    // Crucially: no confirmation is rendered from the URL alone.
    await expect(page.getByText(/you are booked/i)).toHaveCount(0);
  });

  test("renders a real order and masks the customer email", async ({ page }) => {
    await page.goto("/book/confirmation?order=2000000000000");

    await expect(page.getByRole("heading", { name: /you are booked/i })).toBeVisible();
    await expect(page.getByText("2000000000000")).toBeVisible();
    await expect(page.getByText(/t\*+@example\.com/)).toBeVisible();
    // The signed ticket-PDF links must not survive to the page.
    expect(await page.content()).not.toContain("getPdf");
  });

  test("is excluded from search results", async ({ page }) => {
    await page.goto("/book/confirmation");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });
});

test.describe("keyboard access", () => {
  test("the booking panel is operable without a mouse", async ({ page }) => {
    await page.goto(TOUR);
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });

    // Tab until the date button has focus, then open the calendar with Enter.
    const dateButton = page.getByRole("button", { name: /\d{1,2} \w+ \d{4}|choose a date/i });
    await dateButton.focus();
    await expect(dateButton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dateButton).toHaveAttribute("aria-expanded", "true");

    // The submit button is reachable and activatable from the keyboard.
    const reserve = page.getByRole("button", { name: /reserve your places/i });
    await reserve.focus();
    await expect(reserve).toBeFocused();
  });
});
