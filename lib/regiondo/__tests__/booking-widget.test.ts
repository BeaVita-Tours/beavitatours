import { describe, expect, it } from "vitest";

import {
  bookingWidgetEmbedHref,
  bookingWidgetTargetFor,
  parseBookingWidgetTarget,
  pickBookingWidgetId,
} from "@/lib/regiondo/booking-widget";
import { widgetListSchema } from "@/lib/regiondo/schemas";

const UUID_OLD = "11111111-2222-4333-8444-555555555555";
const UUID_NEW = "66666666-7777-4888-9999-000000000000";

describe("widget list shape", () => {
  it("keeps well-formed widgets and drops the rest", () => {
    const parsed = widgetListSchema.parse([
      { widget_id: UUID_OLD, name: "Booking", type: "Booking", product_id: 298190, created_at: "2026-01-01 10:00:00" },
      { name: "no id", type: "Booking" },
      { widget_id: UUID_NEW, name: "Button", type: "Button", product_id: "298190", created_at: "2026-02-01T10:00:00Z" },
    ]);
    expect(parsed.map((w) => w.widget_id)).toEqual([UUID_OLD, UUID_NEW]);
    expect(parsed[1]?.product_id).toBe(298190);
  });

  it("treats null as no widgets", () => {
    expect(widgetListSchema.parse(null)).toEqual([]);
  });
});

describe("pickBookingWidgetId", () => {
  it("takes the newest Booking widget for the product", () => {
    expect(
      pickBookingWidgetId(
        [
          { widget_id: UUID_OLD, type: "Booking", product_id: 298190, created_at: "2026-01-01 10:00:00" },
          { widget_id: UUID_NEW, type: "booking", product_id: 298190, created_at: "2026-03-01 10:00:00" },
        ],
        "298190"
      )
    ).toBe(UUID_NEW);
  });

  it("ignores Product and Button widgets, other products and malformed ids", () => {
    expect(
      pickBookingWidgetId(
        [
          { widget_id: UUID_OLD, type: "Product", product_id: 298190, created_at: "" },
          { widget_id: UUID_OLD, type: "Button", product_id: 298190, created_at: "" },
          { widget_id: UUID_OLD, type: "Booking", product_id: 300877, created_at: "" },
          { widget_id: '"><script>', type: "Booking", product_id: 298190, created_at: "" },
        ],
        "298190"
      )
    ).toBeNull();
  });
});

describe("bookingWidgetTargetFor", () => {
  it("uses a dashboard widget", () => {
    expect(bookingWidgetTargetFor(UUID_NEW)).toEqual({ kind: "widget", widgetId: UUID_NEW });
  });

  it("leaves a tour without one on the API panel", () => {
    expect(bookingWidgetTargetFor(null)).toBeNull();
  });
});

describe("embed URL round trip", () => {
  const roundTrip = (href: string) => parseBookingWidgetTarget(new URL(href, "https://x.test").searchParams);

  it("round-trips a widget", () => {
    const widget = { kind: "widget", widgetId: UUID_NEW } as const;
    expect(bookingWidgetEmbedHref(widget)).toBe(`/embed/regiondo-booking?widget=${UUID_NEW}`);
    expect(roundTrip(bookingWidgetEmbedHref(widget))).toEqual(widget);
  });

  it("refuses anything that could escape an attribute, and the account-code form", () => {
    expect(roundTrip('/e?widget="><script>alert(1)</script>')).toBeNull();
    expect(roundTrip("/e?provider=BE116&product=298190")).toBeNull();
    expect(roundTrip("/e")).toBeNull();
  });
});
