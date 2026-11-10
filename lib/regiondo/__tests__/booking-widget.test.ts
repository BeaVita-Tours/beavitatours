import { describe, expect, it } from "vitest";

import productDetail from "./fixtures/product-detail.json";

import {
  bookingWidgetEmbedHref,
  bookingWidgetTargetFor,
  parseBookingWidgetTarget,
  pickBookingWidgetId,
  providerFromSku,
} from "@/lib/regiondo/booking-widget";
import { toTourDetail } from "@/lib/regiondo/map";
import { productDetailSchema, widgetListSchema } from "@/lib/regiondo/schemas";

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
  it("prefers a dashboard widget", () => {
    expect(
      bookingWidgetTargetFor({ widgetId: UUID_NEW, productId: "298190", provider: "BE116" })
    ).toEqual({ kind: "widget", widgetId: UUID_NEW });
  });

  it("falls back to the account code and product id", () => {
    expect(
      bookingWidgetTargetFor({ widgetId: null, productId: "298190", provider: "BE116" })
    ).toEqual({ kind: "product", provider: "BE116", productId: "298190", locale: "en_US" });
  });

  it("reads the account code from the SKU when the product has none", () => {
    expect(providerFromSku("T-BE116-321530")).toBe("BE116");
    expect(
      bookingWidgetTargetFor({ widgetId: null, productId: "298190", provider: null, sku: "T-BE116-321530" })
    ).toMatchObject({ kind: "product", provider: "BE116" });
  });

  it("gives up (API panel) without an account code", () => {
    expect(
      bookingWidgetTargetFor({ widgetId: null, productId: "298190", provider: null, sku: null })
    ).toBeNull();
  });

  it("gets the account code from a real product", () => {
    const tour = toTourDetail(productDetailSchema.parse(productDetail.data));
    expect(tour.operatorCode).toBe("BE116");
    expect(tour.sku).toBe("T-BE116-321530");
    expect(
      bookingWidgetTargetFor({ widgetId: null, productId: tour.id, provider: tour.operatorCode, sku: tour.sku })
    ).toEqual({ kind: "product", provider: "BE116", productId: "298190", locale: "en_US" });
  });
});

describe("embed URL round trip", () => {
  const roundTrip = (href: string) => parseBookingWidgetTarget(new URL(href, "https://x.test").searchParams);

  it("round-trips both forms", () => {
    const widget = { kind: "widget", widgetId: UUID_NEW } as const;
    const product = { kind: "product", provider: "BE116", productId: "298190", locale: "en_US" } as const;
    expect(bookingWidgetEmbedHref(product)).toBe(
      "/embed/regiondo-booking?provider=BE116&product=298190&locale=en_US"
    );
    expect(roundTrip(bookingWidgetEmbedHref(widget))).toEqual(widget);
    expect(roundTrip(bookingWidgetEmbedHref(product))).toEqual(product);
  });

  it("refuses anything that could escape an attribute", () => {
    expect(roundTrip('/e?widget="><script>alert(1)</script>')).toBeNull();
    expect(roundTrip('/e?provider=BE116&product=1"onload="x')).toBeNull();
    expect(roundTrip("/e?provider=BE116&product=T-BE116-321530")).toBeNull();
    expect(roundTrip("/e?provider=BE116&product=298190&locale=en")).toBeNull();
    expect(roundTrip("/e")).toBeNull();
  });
});
