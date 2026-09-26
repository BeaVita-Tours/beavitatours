import { expect, type Page, test } from "@playwright/test";

/**
 * The booking flow, end to end, against the mock Regiondo in
 * `e2e/mock-regiondo.mjs`.
 *
 * The scenarios are the ones that cost money when they go wrong: the happy
 * path must reach the payment handoff in one step, and a departure that sells
 * out must not let anyone start a booking.
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
    await page.goto("/tours/group-tours");
    const nav = page.getByRole("navigation", { name: /main/i });
    await expect(nav.getByRole("link", { name: /all tours/i })).toHaveCount(0);

    // Mobile viewport: the links live in the collapsed menu.
    await page.getByRole("button", { name: "Open menu" }).click();
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

  test("/tours/prosecco redirects into Food & Wine, which opens with the Prosecco hills", async ({
    page,
  }) => {
    await page.goto("/tours/prosecco");
    await expect(page).toHaveURL(/\/tours\/wine-food$/);
    await expect(page.getByRole("heading", { name: /start with the prosecco hills/i })).toBeVisible();
    expect(await page.locator('a[href^="/tours/venice-prosecco-"]').count()).toBeGreaterThan(0);
  });

  test("group tours are grouped by theme, empty themes hidden", async ({ page }) => {
    // Not a flat catalog: the client wanted the shared departures offered by
    // theme, in this order. The two private-only themes have no shared
    // departure and are simply absent — no empty heading.
    await page.goto("/tours/group-tours");
    const headings = page.getByRole("heading", { level: 2 });
    await expect(headings.filter({ hasText: "Dolomites" }).first()).toBeVisible();
    const names = (await headings.allTextContents()).map((t) => t.trim());
    expect(names.indexOf("Dolomites")).toBeLessThan(names.indexOf("Food & Wine"));
    expect(names).not.toContain("Active & Adventure");
    expect(names).not.toContain("Culture & History");
    // No breadcrumb and no filter panel on this page.
    await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Under €150" })).toHaveCount(0);
  });

  test("lists tours with prices and links to a detail page", async ({ page }) => {
    await page.goto("/tours/private-tours");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Private day tours");

    const cards = page.getByRole("heading", { level: 3 });
    expect(await cards.count()).toBeGreaterThan(0);

    // Price must be server-rendered, not filled in by client JavaScript.
    await expect(page.getByText(/€\d/).first()).toBeVisible();
  });

  test("filters through the URL, so the view is shareable and crawlable", async ({ page }) => {
    await page.goto("/tours/private-tours");
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
    // No catalog index any more, so no "see every day trip" link out of the page.
    await expect(page.getByRole("link", { name: /see every day trip we run/i })).toHaveCount(0);
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
    expect(html).toMatch(/<title>Culture &amp; history/);
  });
});

test.describe("happy path", () => {
  test("holds places and hands off to Regiondo's hosted checkout in one step", async ({
    page,
  }) => {
    // Never actually load Regiondo: the whole compliance position is that
    // payment happens on their domain, so all this asserts is that we go there.
    await page.route(/regiondo\.(com|de)/, (route) => route.abort());

    await page.goto(TOUR);

    const reserve = page.getByRole("button", { name: /reserve your places/i });
    await expect(reserve).toBeEnabled({ timeout: 20_000 });

    // There is no form of ours in between. Regiondo's checkout asks for the
    // customer's details itself, and its link cannot be pre-filled (D-008), so
    // asking here as well meant typing everything twice (D-019).
    await expect(page.getByLabel(/first name/i)).toHaveCount(0);

    const handoff = page.waitForRequest(
      (request) => request.isNavigationRequest() && /regiondo\.(com|de)/.test(request.url()),
      { timeout: 20_000 }
    );
    await reserve.click();

    const request = await handoff;
    expect(new URL(request.url()).hostname).toMatch(/regiondo\.(com|de)$/);
    expect(new URL(request.url()).pathname).toContain("/checkout");
  });

  test("never asks for card details on our own origin", async ({ page }) => {
    await page.goto(TOUR);
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });

    // No field on our side should be capable of collecting a card — there is
    // no field on our side at all.
    const html = await page.content();
    expect(html).not.toMatch(/card[_-]?number|cardnumber|cvv|cvc|autocomplete="cc-/i);
    await expect(page.getByText(/never see your card details/i).first()).toBeVisible();
  });
});

test.describe("the party", () => {
  /** The stepper controls, by the labels the guest selector gives them. */
  function stepper(page: Page, tier: string) {
    return {
      add: page.getByRole("button", { name: `Add one ${tier}` }),
      remove: page.getByRole("button", { name: `Remove one ${tier}` }),
      count: page.locator(`output[aria-label="${tier} quantity"]`),
    };
  }

  async function ready(page: Page) {
    await page.goto(TOUR);
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });
  }

  /** The grand total in the summary box — a line total can equal it. */
  function total(page: Page) {
    return page.locator('output[aria-label="Total price"]');
  }

  test("offers every tier with its own quantity and opens with one adult", async ({ page }) => {
    await ready(page);
    await expect(page.getByText("Who is coming?")).toBeVisible();
    await expect(stepper(page, "Adult").count).toHaveText("1");
    await expect(stepper(page, "Young (7-14)").count).toHaveText("0");
    // Each tier states its own price; the headline is the cheapest, "from".
    await expect(page.getByText("€115").first()).toBeVisible();
    await expect(page.getByText("€99").first()).toBeVisible();
  });

  test("2 Adults + 2 Young: two holds, one checkout link, the right totals", async ({
    page,
  }) => {
    await page.route(/regiondo\.(com|de)/, (route) => route.abort());
    await ready(page);

    await stepper(page, "Adult").add.click();
    await stepper(page, "Young (7-14)").add.click();
    await stepper(page, "Young (7-14)").add.click();

    await expect(stepper(page, "Adult").count).toHaveText("2");
    await expect(stepper(page, "Young (7-14)").count).toHaveText("2");
    await expect(page.getByText("2 × Adult")).toBeVisible();
    await expect(page.getByText("2 × Young (7-14)")).toBeVisible();
    await expect(page.getByText("4 guests")).toBeVisible();
    // 2 × 115 + 2 × 99
    await expect(total(page)).toHaveText("€428");

    const handoff = page.waitForRequest(
      (request) => request.isNavigationRequest() && /regiondo\.(com|de)/.test(request.url()),
      { timeout: 20_000 }
    );
    await page.getByRole("button", { name: /reserve your places/i }).click();
    const request = await handoff;

    // What actually reached the API: one hold per tier, both under one link.
    const recorded = await (await page.request.get(`${MOCK}/__holds`)).json();
    expect(recorded.holds.map((h: { option_id: string; qty: number }) => [h.option_id, h.qty])).toEqual([
      ["2052614", 2],
      ["2052711", 2],
    ]);
    expect(recorded.holds.every((h: { released: boolean }) => !h.released)).toBe(true);
    expect(recorded.checkoutLinks).toHaveLength(1);
    expect(recorded.checkoutLinks[0]).toHaveLength(2);
    for (const hold of recorded.holds) {
      expect(request.url()).toContain(hold.code);
    }
  });

  test("quantities can be changed after the fact and a tier removed entirely", async ({
    page,
  }) => {
    await ready(page);
    const adult = stepper(page, "Adult");
    const young = stepper(page, "Young (7-14)");

    // 1 Adult + 1 Young
    await young.add.click();
    await expect(page.getByText("2 guests")).toBeVisible();
    await expect(total(page)).toHaveText("€214");

    // Change your mind: another adult.
    await adult.add.click();
    await expect(page.getByText("3 guests")).toBeVisible();
    await expect(total(page)).toHaveText("€329");

    // Drop the child altogether — the line disappears from the summary.
    await young.remove.click();
    await expect(young.count).toHaveText("0");
    await expect(page.getByText(/× Young/)).toHaveCount(0);
    await expect(page.getByText("2 guests")).toBeVisible();
    await expect(total(page)).toHaveText("€230");
    await expect(young.remove).toBeDisabled();
  });

  test("with nobody in the party there is nothing to reserve", async ({ page }) => {
    await ready(page);
    await stepper(page, "Adult").remove.click();
    await expect(page.getByText("Add at least one guest").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /add at least one guest/i })).toBeDisabled();
    await expect(total(page)).toHaveText("€0");
  });

  test("the departure's own seat count is the ceiling, not the tier's stock", async ({
    page,
  }) => {
    // The mock's tiers report 22 and 49 places each; the departure has 9.
    await ready(page);
    await expect(page.getByText(/only 9 places left on this departure/i)).toBeVisible();
    const adult = stepper(page, "Adult");
    for (let i = 0; i < 15; i++) {
      if (await adult.add.isDisabled()) break;
      await adult.add.click();
    }
    await expect(adult.count).toHaveText("9");
    await expect(adult.add).toBeDisabled();
  });

  test("Adult and Young share the coach: the party as a whole is capped", async ({ page }) => {
    await ready(page);
    const adult = stepper(page, "Adult");
    const young = stepper(page, "Young (7-14)");

    await young.add.click();
    await young.add.click();
    for (let i = 0; i < 15; i++) {
      if (await adult.add.isDisabled()) break;
      await adult.add.click();
    }
    // 2 Young + 7 Adults = the 9 places; nothing more can be added anywhere.
    await expect(adult.count).toHaveText("7");
    await expect(adult.add).toBeDisabled();
    await expect(young.add).toBeDisabled();
    await expect(page.getByText("9 guests")).toBeVisible();
    await expect(page.getByText(/all 9 remaining places taken/i)).toBeVisible();

    // Give one adult back and the child row opens up again.
    await adult.remove.click();
    await expect(young.add).toBeEnabled();
  });

  test("the party survives a reload", async ({ page }) => {
    await ready(page);
    await stepper(page, "Adult").add.click();
    await stepper(page, "Young (7-14)").add.click();
    await expect(total(page)).toHaveText("€329");

    await page.reload();
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });
    await expect(stepper(page, "Adult").count).toHaveText("2");
    await expect(stepper(page, "Young (7-14)").count).toHaveText("1");
    await expect(total(page)).toHaveText("€329");
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

    // The calendar is inline: an available day takes focus and Enter picks it.
    const day = page.locator(".rdp-beavita table button:not([disabled])").first();
    await day.focus();
    await expect(day).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /reserve your places/i })).toBeEnabled({
      timeout: 20_000,
    });

    // The submit button is reachable and activatable from the keyboard.
    const reserve = page.getByRole("button", { name: /reserve your places/i });
    await reserve.focus();
    await expect(reserve).toBeFocused();
  });
});
