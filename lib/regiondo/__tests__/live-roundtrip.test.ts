import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Live round trip against the real Regiondo API.
 *
 * Skipped by default. Run it deliberately:
 *
 *     REGIONDO_LIVE_TESTS=1 pnpm test
 *
 * There is no sandbox account for this key pair — sandbox-api.regiondo.com
 * rejects the live keys with 403 — so this is the only way to prove the wrapper
 * works end to end. It is written to be safe to run against production:
 *
 *  - the read half only reads;
 *  - the write half creates ONE hold and releases it in the same test, on a
 *    high-capacity shared departure. A hold is not a booking: it reserves stock
 *    for 20 minutes, charges nobody, notifies nobody, and expires on its own if
 *    the release fails;
 *  - `POST /checkout/purchase` is never called, here or anywhere in this
 *    codebase.
 *
 * Keys are read straight from .env.local rather than from the Vitest env block,
 * which deliberately supplies fakes so no other test can reach the network.
 */

const LIVE = process.env.REGIONDO_LIVE_TESTS === "1";
const describeLive = LIVE ? describe : describe.skip;

/** A high-capacity shared departure: cheapest thing to briefly hold. */
const PRODUCT_ID = "298190";
const VARIATION_ID = "723805";

function loadEnvLocal(): void {
  const raw = readFileSync(new URL("../../../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key.startsWith("REGIONDO_") && value) process.env[key] = value;
  }
  process.env.REGIONDO_NATIVE_BOOKING = "true";
}

/** A date far enough out that a same-day booking notice cannot block it. */
function dateInDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

describeLive("live Regiondo round trip", () => {
  let products: typeof import("../products");
  let checkout: typeof import("../checkout");

  beforeAll(async () => {
    loadEnvLocal();
    const config = await import("../config");
    config.resetConfigCache();
    products = await import("../products");
    checkout = await import("../checkout");
  });

  it("lists collections", async () => {
    const collections = await products.getCollections();
    expect(collections.length).toBeGreaterThan(0);
    expect(collections.some((c) => /shared/i.test(c.title))).toBe(true);
  });

  it("lists the catalog with parsed prices", async () => {
    const { tours, degraded } = await products.listTours({ limit: 250 });
    expect(degraded).toBe(false);
    expect(tours.length).toBeGreaterThan(0);
    for (const tour of tours) {
      expect(Number.isFinite(tour.priceFrom.amount)).toBe(true);
      expect(tour.priceFrom.amount).toBeGreaterThan(0);
      expect(tour.href.startsWith("/tours/")).toBe(true);
    }
  });

  it("fetches one tour with variations and sanitised copy", async () => {
    const tour = await products.getTour(PRODUCT_ID);
    expect(tour).not.toBeNull();
    expect(tour?.variations.length).toBeGreaterThan(0);
    expect(tour?.highlights.length).toBeGreaterThan(0);
    // Sanitisation must survive the round trip: no script, no iframe, no
    // event handlers, in any field we render as HTML.
    const html = [tour?.descriptionHtml, tour?.includedHtml, tour?.otherInfoHtml].join(" ");
    expect(html).not.toMatch(/<script|<iframe|on\w+=/i);
  });

  it("fetches live availability and options", async () => {
    const availability = await products.getAvailability(
      VARIATION_ID,
      dateInDays(7),
      dateInDays(21)
    );
    const dates = Object.keys(availability);
    expect(dates.length).toBeGreaterThan(0);

    const [date] = dates;
    const [time] = availability[date] ?? [];
    expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);

    const options = await products.getOptions(VARIATION_ID, date, time);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0]?.price.amount).toBeGreaterThan(0);
    // Live stock. If this is null the whole booking panel has nothing to say.
    expect(options[0]?.seatsLeft).not.toBeNull();
  });

  it("holds, totals, prolongs and releases — the whole write path bar purchase", async () => {
    const availability = await products.getAvailability(
      VARIATION_ID,
      dateInDays(10),
      dateInDays(24)
    );
    const [date] = Object.keys(availability);
    const [time] = availability[date] ?? [];
    const options = await products.getOptions(VARIATION_ID, date, time);
    const option = options.find((o) => (o.seatsLeft ?? 0) >= 1);
    expect(option, "no option with stock to hold").toBeDefined();

    const item = {
      productId: PRODUCT_ID,
      optionId: option!.id,
      dateTime: checkout.toRegiondoDateTime(date, time),
      qty: 1,
    };

    let reservationCode: string | null = null;
    try {
      const hold = await checkout.createHold({ item });
      reservationCode = hold.code;

      expect(hold.code).toBeTruthy();
      expect(hold.expiresAt).toBeTruthy();
      expect(hold.totals?.grandTotal).toBeGreaterThan(0);
      // The checkout form is generated from these, so an empty list would mean
      // rendering a form that collects nothing.
      const viewTypes = [...hold.contactFields, ...hold.buyerFields].map((f) => f.viewType);
      expect(viewTypes).toContain("email");

      // The hold's expiry must land in the near future once the local wall
      // clock has been converted through its time zone. Reading it as UTC
      // would put a 20-minute hold one or two hours out.
      const minutesOut = (Date.parse(hold.expiresAt!) - Date.now()) / 60_000;
      expect(minutesOut).toBeGreaterThan(0);
      expect(minutesOut).toBeLessThanOrEqual(25);

      // Totals recomputed server-side must agree with the hold's own totals.
      const totals = await checkout.getTotals([item], { reservationCode: hold.code });
      expect(totals.grandTotal).toBeCloseTo(hold.totals!.grandTotal, 2);
      expect(totals.currency).toBe("EUR");

      const prolonged = await checkout.prolongHold(hold.code, 20);
      expect(prolonged.code).toBeTruthy();
      expect(prolonged.expiresAt).toBeTruthy();
      reservationCode = prolonged.code;

      // Inspect the hosted checkout link without following it. This is the
      // payment handoff, and the assertion that matters is the host: card data
      // must only ever be entered on Regiondo's domain.
      const link = await checkout.getCheckoutLink(prolonged.code);
      expect(link).toMatch(/^https:\/\//);
      expect(new URL(link).hostname).toMatch(/regiondo\.(com|de)$/);
      console.info(
        JSON.stringify({
          at: "live.checkoutlink",
          host: new URL(link).hostname,
          path: new URL(link).pathname,
          params: [...new URL(link).searchParams.keys()],
        })
      );
    } finally {
      if (reservationCode) await checkout.releaseHold(reservationCode);
    }
  }, 60_000);
});
