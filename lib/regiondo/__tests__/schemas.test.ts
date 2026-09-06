import { describe, expect, it } from "vitest";

import accountCurrency from "./fixtures/account-currency.json";
import availabilities from "./fixtures/availabilities.json";
import availoptionsGroup from "./fixtures/availoptions-group.json";
import availoptions from "./fixtures/availoptions.json";
import bookingScrubbed from "./fixtures/booking-scrubbed.json";
import orderOptionFields from "./fixtures/order-option-fields.json";
import productDetailThousands from "./fixtures/product-detail-thousands.json";
import productDetail from "./fixtures/product-detail.json";
import productsList from "./fixtures/products-list.json";
import reviews from "./fixtures/reviews.json";
import tags from "./fixtures/tags.json";
import variations from "./fixtures/variations.json";

import {
  accountCurrencySchema,
  availabilitySchema,
  bookingListSchema,
  numeric,
  optionListSchema,
  orderOptionFieldsSchema,
  productDetailSchema,
  productListSchema,
  reviewListSchema,
  tagListSchema,
  variationListSchema,
} from "@/lib/regiondo/schemas";

/**
 * Every fixture in ./fixtures was captured from the live API and scrubbed.
 * They exist so that a schema change that would break against real data fails
 * here rather than in production — the shapes below are not hypothetical.
 */

describe("numeric coercion", () => {
  it("parses plain decimal strings", () => {
    expect(numeric.parse("159.00")).toBe(159);
  });

  it("parses thousands separators, which are the actual failure mode", () => {
    // Number("1,600.00") is NaN and parseFloat("1,600.00") is 1. Both wrong.
    expect(numeric.parse("1,600.00")).toBe(1600);
    expect(numeric.parse("1,200.00")).toBe(1200);
    expect(numeric.parse("12,345.67")).toBe(12345.67);
  });

  it("passes numbers through", () => {
    expect(numeric.parse(40)).toBe(40);
    expect(numeric.parse(0)).toBe(0);
  });

  it("treats the empty string as zero", () => {
    expect(numeric.parse("")).toBe(0);
  });

  it("rejects genuine nonsense rather than silently yielding NaN", () => {
    expect(numeric.safeParse("not a price").success).toBe(false);
  });
});

describe("catalog schemas against live fixtures", () => {
  it("parses the product list", () => {
    const parsed = productListSchema.parse(productsList.data);
    expect(parsed.length).toBeGreaterThan(0);
    for (const product of parsed) {
      expect(typeof product.product_id).toBe("string");
      expect(typeof product.base_price).toBe("number");
      expect(Number.isFinite(product.base_price)).toBe(true);
    }
  });

  it("parses a full product detail", () => {
    const parsed = productDetailSchema.parse(productDetail.data);
    expect(parsed.product_id).toBe("298190");
    expect(parsed.base_price).toBe(159);
    expect(parsed.duration_values).toBe(9);
    expect(parsed.duration_type).toBe("hour");
    expect(parsed.timezone).toBe("Europe/Rome");
    expect(parsed.image_sort_order.length).toBeGreaterThan(0);
    expect(parsed.image_sort_order[0]?.position).toBe(0);
  });

  it("drops the availability calendar embedded in the product detail", () => {
    // It is live stock data riding inside a cacheable payload. Caching it would
    // serve a calendar that is minutes-to-hours out of date.
    const parsed = productDetailSchema.parse(productDetail.data);
    for (const variation of parsed.variations) {
      expect(variation).not.toHaveProperty("available_dates");
      expect(variation).not.toHaveProperty("available_dates_times");
    }
    expect(JSON.stringify(parsed)).not.toContain("available_dates");
  });

  it("parses a price carrying a thousands separator", () => {
    const parsed = productDetailSchema.partial().parse(productDetailThousands.data);
    expect(parsed.base_price).toBe(1600);
  });

  it("keeps HTML in descriptions rather than mangling it", () => {
    // Sanitising is a render-time concern; the boundary must not lose content.
    const parsed = productDetailSchema.parse(productDetail.data);
    expect(parsed.faq_included).toContain("<li>");
    expect(parsed.short_description).toContain("<p>");
  });

  it("parses tags", () => {
    const parsed = tagListSchema.parse(tags.data);
    expect(parsed.map((t) => t.tag_id).sort()).toEqual(["45420", "45421"]);
  });

  it("parses the lightweight variation list", () => {
    const parsed = variationListSchema.parse(variations.data);
    expect(parsed).toEqual([
      { id: "723805", name: "Ticket" },
      { id: "818816", name: "Group" },
    ]);
  });

  it("parses account currency", () => {
    const parsed = accountCurrencySchema.parse(accountCurrency.data);
    expect(parsed[0]?.currency_code).toBe("EUR");
    expect(parsed[0]?.is_base).toBe(true);
  });
});

describe("availability and options", () => {
  it("flattens the nested date -> [[time]] calendar", () => {
    const parsed = availabilitySchema.parse(availabilities.data);
    expect(parsed["2026-09-10"]).toEqual(["08:00:00"]);
    expect(Object.keys(parsed)).toHaveLength(4);
  });

  it("handles a flat date -> [time] calendar too", () => {
    const parsed = availabilitySchema.parse({ "2026-09-10": ["08:00:00", "14:00:00"] });
    expect(parsed["2026-09-10"]).toEqual(["08:00:00", "14:00:00"]);
  });

  it("de-duplicates and sorts times", () => {
    const parsed = availabilitySchema.parse({
      "2026-09-10": [["14:00:00"], ["08:00:00"], ["14:00:00"]],
    });
    expect(parsed["2026-09-10"]).toEqual(["08:00:00", "14:00:00"]);
  });

  it("turns the option map keyed by option id into an array", () => {
    // /products/availoptions returns { "2028639": {...} }, not [ {...} ].
    const parsed = optionListSchema.parse(availoptions.data);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.option_id).toBe("2028639");
    expect(parsed[0]?.regiondo_price).toBe(159);
    expect(parsed[0]?.qty_left).toBe(25);
  });

  it("reads per-order limits and a discounted price on the group option", () => {
    const parsed = optionListSchema.parse(availoptionsGroup.data);
    const option = parsed[0];
    expect(option?.name).toBe("Group");
    expect(option?.min_qty_to_sell).toBe(1);
    expect(option?.max_qty_to_sell).toBe(8);
    // regiondo_price is what is charged; original_price is the strike-through.
    expect(option?.regiondo_price).toBeLessThan(option?.original_price ?? 0);
  });

  it("accepts an already-array option payload", () => {
    const parsed = optionListSchema.parse(Object.values(availoptions.data));
    expect(parsed).toHaveLength(1);
  });
});

describe("reviews", () => {
  it("parses real reviews with both percent and 1-5 vote values", () => {
    const parsed = reviewListSchema.parse(reviews.data);
    expect(parsed.length).toBeGreaterThan(0);
    const overall = parsed[0]?.vote_details.find((v) => v.rating_code === "Overall rating");
    expect(overall?.percent).toBeGreaterThan(0);
    expect(overall?.value).toBeGreaterThanOrEqual(1);
    expect(overall?.value).toBeLessThanOrEqual(5);
    expect(parsed[0]?.nickname).toBeTruthy();
  });
});

describe("checkout schemas", () => {
  it("parses the API-driven buyer field definitions", () => {
    const parsed = orderOptionFieldsSchema.parse(orderOptionFields);
    const viewTypes = parsed.buyer_data_required.map((f) => f.view_type);
    expect(viewTypes).toContain("email");
    expect(viewTypes).toContain("phone");
    expect(parsed.buyer_data_required.every((f) => f.required)).toBe(true);
    // field_id normalises to a string so it can key a form safely.
    expect(typeof parsed.buyer_data_required[0]?.field_id).toBe("string");
  });

  it("parses a booking, coercing its string money and counts", () => {
    const parsed = bookingListSchema.parse(bookingScrubbed.data);
    const booking = parsed[0];
    expect(typeof booking?.qty).toBe("number");
    expect(typeof booking?.total_amount).toBe("number");
    expect(booking?.booking_status?.code).toBeTruthy();
  });
});
