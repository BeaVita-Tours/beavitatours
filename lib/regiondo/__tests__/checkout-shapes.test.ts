import { describe, expect, it } from "vitest";

import checkoutLink from "./fixtures/checkout-link.json";
import checkoutTotals from "./fixtures/checkout-totals.json";
import errorReservationNotFound from "./fixtures/error-reservation-not-found.json";
import errorStockNotAvailable from "./fixtures/error-stock-not-available.json";
import holdList from "./fixtures/hold-list.json";
import holdResponse from "./fixtures/hold-response.json";

import { holdExpiryToIso } from "@/lib/regiondo/checkout";
import { fromCheckoutResult } from "@/lib/regiondo/errors";
import {
  checkoutLinkSchema,
  checkoutTotalsSchema,
  reservationSchema,
  reservationUpdateSchema,
} from "@/lib/regiondo/schemas";

/**
 * These fixtures were captured from a real hold/totals/prolong/release cycle
 * against the live API (reservation codes replaced with synthetic ones). They
 * exist because the live responses differ from the OpenAPI document in four
 * places, each of which broke a schema written from the spec alone.
 */

describe("hold response shape", () => {
  it("accepts reservation_data as a single object, which is what live returns", () => {
    // The spec types this as `array<reservationCode>`. It is not.
    expect(Array.isArray(holdResponse.reservation_data)).toBe(false);

    const parsed = reservationSchema.parse(holdResponse);
    expect(parsed.reservation_data).toHaveLength(1);
    expect(parsed.reservation_data[0]?.code).toBe(
      "74600000-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    expect(parsed.reservation_data[0]?.timezone).toBe("Europe/Berlin");
  });

  it("still accepts the array form the spec describes", () => {
    const parsed = reservationSchema.parse({
      ...holdResponse,
      reservation_data: [holdResponse.reservation_data],
    });
    expect(parsed.reservation_data).toHaveLength(1);
  });

  it("accepts the array form GET /checkout/hold returns", () => {
    const parsed = reservationSchema.parse({ reservation_data: holdList.data });
    expect(parsed.reservation_data).toHaveLength(1);
  });

  it("reads tax from {title, value}, not the spec's {amount, percent}", () => {
    const parsed = reservationSchema.parse(holdResponse);
    expect(parsed.totals?.grand_total).toBe(159);
    expect(parsed.totals?.subtotal).toBe(144.5455);
    expect(parsed.totals?.tax?.amount).toBeCloseTo(14.4545, 4);
    // subtotal is net, grand_total is gross. The customer pays grand_total.
    expect(parsed.totals!.subtotal + parsed.totals!.tax!.amount!).toBeCloseTo(
      parsed.totals!.grand_total,
      2
    );
  });

  it("returns the required-field definitions alongside the hold", () => {
    const parsed = reservationSchema.parse(holdResponse);
    expect(parsed.contact_data_required).toContain("email");
    expect(parsed.buyer_data_required).toHaveLength(4);
    // Live buyer fields carry no view_type; checkout.ts infers one from the
    // title so the form can still set input types and autocomplete.
    expect(parsed.buyer_data_required[0]?.view_type).toBe("");
  });

  it("parses the prolong envelope", () => {
    const parsed = reservationUpdateSchema.parse({
      reservation_data: holdResponse.reservation_data,
      date_time: "2026-09-19 08:00",
    });
    expect(parsed.reservation_data[0]?.code).toBeTruthy();
  });
});

describe("hold expiry time zone handling", () => {
  it("reads a local wall clock through its time zone, not as UTC", () => {
    // 23:03 Europe/Berlin in September is CEST (UTC+2) -> 21:03Z.
    expect(holdExpiryToIso("2026-09-06 23:03", "Europe/Berlin")).toBe(
      "2026-09-06T21:03:00.000Z"
    );
  });

  it("handles the winter offset for the same zone", () => {
    // January is CET (UTC+1) -> 22:03Z. Reading the string as UTC would put a
    // 20-minute hold an hour or two out and break the countdown.
    expect(holdExpiryToIso("2026-01-06 23:03", "Europe/Berlin")).toBe(
      "2026-01-06T22:03:00.000Z"
    );
  });

  it("handles Europe/Rome, the product time zone", () => {
    expect(holdExpiryToIso("2026-09-06 23:03", "Europe/Rome")).toBe(
      "2026-09-06T21:03:00.000Z"
    );
  });

  it("treats a missing zone as UTC rather than throwing", () => {
    expect(holdExpiryToIso("2026-09-06 23:03", null)).toBe("2026-09-06T23:03:00.000Z");
  });

  it("falls back instead of throwing on an unknown zone", () => {
    expect(holdExpiryToIso("2026-09-06 23:03", "Not/AZone")).toBe("2026-09-06T23:03:00.000Z");
  });

  it("returns null for a missing or unparseable value", () => {
    expect(holdExpiryToIso(null, "Europe/Rome")).toBeNull();
    expect(holdExpiryToIso("soon", "Europe/Rome")).toBeNull();
  });
});

describe("checkout link", () => {
  it("accepts the single object live returns, and the spec's array", () => {
    const fromObject = checkoutLinkSchema.parse(checkoutLink.data);
    const fromArray = checkoutLinkSchema.parse([checkoutLink.data]);
    expect(fromObject).toHaveLength(1);
    expect(fromArray).toHaveLength(1);
  });

  it("points at a Regiondo-hosted ticketshop", () => {
    // This is the whole compliance argument: the card is entered there, on
    // their domain, never here.
    const [link] = checkoutLinkSchema.parse(checkoutLink.data);
    expect(new URL(link.checkout_link).hostname).toMatch(/\.regiondo\.com$/);
  });

  it("carries no return-URL parameter, which is the documented gap", () => {
    // The link is path-based with no query string at all, so we cannot ask
    // Regiondo to send the customer back to /book/confirmation from here.
    const [link] = checkoutLinkSchema.parse(checkoutLink.data);
    expect([...new URL(link.checkout_link).searchParams.keys()]).toHaveLength(0);
  });
});

describe("totals", () => {
  it("parses totals and the available payment methods", () => {
    const parsed = checkoutTotalsSchema.parse(checkoutTotals);
    expect(parsed.totals.grand_total).toBe(159);
    expect(parsed.payments_available.map((p) => p.code)).toEqual([
      "reservation",
      "cashregister",
      "invoice",
      "api_external",
    ]);
  });

  it("offers no consumer card payment through the API", () => {
    // `paid_cc` exists only as a bookkeeping label under `cashregister`, which
    // records a card taken in person on a terminal. There is no code here that
    // would accept a card number, which is why the hosted ticketshop is the
    // only payment path this integration implements.
    const parsed = checkoutTotalsSchema.parse(checkoutTotals);
    expect(parsed.payments_available.map((p) => p.code)).not.toContain("creditcard");
    const cashRegister = parsed.payments_available.find((p) => p.code === "cashregister");
    expect(cashRegister?.payment_options.map((o) => o.name)).toContain("paid_cc");
  });
});

describe("checkout error envelopes", () => {
  it("maps a stock failure and keeps the partial availability", () => {
    const { result, message, available_items, not_available_items } =
      errorStockNotAvailable.data;
    const error = fromCheckoutResult(result, message, {
      availableItems: available_items,
      notAvailableItems: not_available_items,
    });

    expect(error.kind).toBe("stock_unavailable");
    expect(error.retryable).toBe(false);
    // The UI needs this to say "only 2 left" rather than "something failed".
    expect((error.availableItems as { qty: number }[])[0]?.qty).toBe(2);
  });

  it("maps a missing reservation to an expiry the UI can recover from", () => {
    const error = fromCheckoutResult(
      errorReservationNotFound.data.result,
      errorReservationNotFound.data.message
    );
    expect(error.kind).toBe("reservation_expired");
  });
});
