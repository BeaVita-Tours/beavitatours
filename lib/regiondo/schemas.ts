import "server-only";

import { z } from "zod";

/**
 * The zod boundary. Regiondo's raw shapes stop here.
 *
 * Three habits of this API make an unvalidated pass-through untenable:
 *
 *  1. Numbers arrive as locale-formatted strings — `"159.00"`, and for anything
 *     over a thousand, `"1,600.00"`. `Number("1,600.00")` is NaN and
 *     `parseFloat` is 1, so both of the obvious readings are wrong.
 *  2. Collections are sometimes keyed objects rather than arrays
 *     (`/products/availoptions` is keyed by option id).
 *  3. Descriptions and every `faq_*` field contain HTML.
 *
 * Everything below normalises those away, so components receive plain numbers,
 * arrays, and strings that are explicitly marked as HTML.
 */

/* -------------------------------------------------------------------------- */
/* primitives                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Regiondo money and counts. Accepts a number or a formatted string and always
 * yields a number. The comma is a thousands separator in every response we have
 * seen (the account's base currency is EUR but the API formats en-US style).
 */
export const numeric = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    if (typeof value === "number") return value;
    const cleaned = value.replace(/,/g, "").trim();
    if (cleaned === "") return 0;
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `not a number: ${value}` });
      return z.NEVER;
    }
    return parsed;
  });

export const numericNullable = z
  .union([z.number(), z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    if (typeof value === "number") return value;
    const cleaned = value.replace(/,/g, "").trim();
    if (cleaned === "") return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  });

/** IDs arrive as strings in list responses and numbers in others. */
export const id = z.union([z.number(), z.string()]).transform((v) => String(v));
export const idNumber = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "number" ? v : Number.parseInt(v, 10)))
  .pipe(z.number().int());

const nullableString = z.string().nullish().transform((v) => v ?? null);
const stringOrEmpty = z.string().nullish().transform((v) => v ?? "");

/** `"1"` / `1` / `true` all mean true here. */
const flag = z
  .union([z.boolean(), z.number(), z.string()])
  .nullish()
  .transform((v) => v === true || v === 1 || v === "1");

/**
 * A keyed object where an array was the natural shape. `/products/availoptions`
 * returns `{ "2028639": {...} }`; the key duplicates `option_id` inside.
 */
function keyedRecord<T extends z.ZodTypeAny>(item: T) {
  return z
    .union([z.record(z.string(), item), z.array(item)])
    .transform((value) => (Array.isArray(value) ? value : Object.values(value)));
}

/* -------------------------------------------------------------------------- */
/* catalog                                                                    */
/* -------------------------------------------------------------------------- */

export const tagSchema = z.object({
  tag_id: id,
  name: z.string(),
  url_key: z.string(),
});
export type RegiondoTag = z.infer<typeof tagSchema>;
export const tagListSchema = z.array(tagSchema);

const gallerySchema = z.object({
  url: z.string(),
  thumbnail_url: nullableString,
  position: z.union([z.number(), z.string()]).transform((v) => Number(v) || 0),
  label: stringOrEmpty,
});

/**
 * Variations as they arrive embedded in a product detail response. The
 * `available_dates` map is deliberately NOT in this schema: it is live stock
 * data riding inside an otherwise cacheable payload, and caching it would serve
 * stale availability. Read it from /products/availabilities instead. zod strips
 * unknown keys by default, so it is dropped rather than merely ignored.
 */
export const productVariationSchema = z.object({
  variation_id: id,
  name: stringOrEmpty,
  from: nullableString,
  to: nullableString,
  appointment_type: nullableString,
});
export type ProductVariation = z.infer<typeof productVariationSchema>;

/** `/products/variations/{id}` — a lighter list. */
export const variationListSchema = z.array(
  z.object({ id: id, name: stringOrEmpty })
);

const productCoreShape = {
  product_id: id,
  name: z.string(),
  sku: nullableString,
  short_description: stringOrEmpty,
  description: stringOrEmpty,
  url_key: stringOrEmpty,
  base_price: numeric.default(0),
  original_price: numericNullable.default(null),
  currency_code: z.string().default("EUR"),
  image: nullableString,
  thumbnail: nullableString,
  small_image: nullableString,
  rating_summary: numericNullable.default(null),
  reviews_count: numericNullable.default(null),
  duration_type: nullableString,
  duration_values: numericNullable.default(null),
  city: nullableString,
  location_name: nullableString,
  location_address: nullableString,
  geo_lat: numericNullable.default(null),
  geo_lon: numericNullable.default(null),
  timezone: nullableString,
  language_titles: nullableString,
  ticket_languages: nullableString,
  ticket_highlights: stringOrEmpty,
  meta_title: nullableString,
  meta_description: nullableString,
  faq_included: stringOrEmpty,
  faq_not_included: stringOrEmpty,
  faq_participants: stringOrEmpty,
  faq_customer_requirements: stringOrEmpty,
  faq_other_info: stringOrEmpty,
  important_info: stringOrEmpty,
  is_appointment_needed: flag,
  booking_notice_period: numericNullable.default(null),
  created_at: nullableString,
  updated_at: nullableString,
} as const;

export const productListItemSchema = z.object({
  ...productCoreShape,
  in_stock: flag.optional(),
  category_titles: nullableString,
});
export type RegiondoProductListItem = z.infer<typeof productListItemSchema>;
export const productListSchema = z.array(productListItemSchema);

export const productDetailSchema = z.object({
  ...productCoreShape,
  provider: nullableString,
  product_supplier_id: id.nullish(),
  category_titles: nullableString,
  location_specific_info: stringOrEmpty,
  parking_options_comment: stringOrEmpty,
  public_transport_comment: stringOrEmpty,
  in_stock: flag.optional(),
  is_expired: flag.optional(),
  image_url: z.array(z.string()).default([]),
  image_sort_order: z.array(gallerySchema).default([]),
  video_url: z.array(z.string()).default([]),
  variations: z.array(productVariationSchema).default([]),
  total_vote_details: z
    .array(z.object({ percent: numeric, rating_code: z.string() }))
    .default([]),
});
export type RegiondoProductDetail = z.infer<typeof productDetailSchema>;

/* -------------------------------------------------------------------------- */
/* availability + options (never cached)                                      */
/* -------------------------------------------------------------------------- */

/**
 * `/products/availabilities/{variationId}` returns the same calendar twice:
 * `data` as date -> array-of-arrays-of-times, and `dates_times` as the flat
 * date -> times we actually want. The client unwraps `data`, so the flat map is
 * gone by the time we get here and the nested form is what we normalise.
 */
export const availabilitySchema = z
  .record(z.string(), z.array(z.union([z.array(z.string()), z.string()])))
  .transform((raw) => {
    const out: Record<string, string[]> = {};
    for (const [date, slots] of Object.entries(raw)) {
      const times = slots.flatMap((slot) => (Array.isArray(slot) ? slot : [slot]));
      out[date] = [...new Set(times)].sort();
    }
    return out;
  });
export type AvailabilityMap = z.infer<typeof availabilitySchema>;

/**
 * A bookable participant tier, with live stock. `qty_left` moves with the
 * date/time filter, which is precisely why nothing on this path is cached.
 *
 * `max_qty_to_sell` of 0 means "no per-order cap", not "cannot be sold" —
 * the observed shared-tour option reports `min 0 / max 0 / capacity 40`.
 */
export const optionSchema = z.object({
  option_id: id,
  variation_id: id,
  name: z.string(),
  description: stringOrEmpty,
  sort_order: numericNullable.default(null),
  original_price: numeric.default(0),
  regiondo_price: numeric.default(0),
  vat_percentage_val: numericNullable.default(null),
  min_qty_to_sell: numeric.default(0),
  max_qty_to_sell: numeric.default(0),
  capacity: numericNullable.default(null),
  qty_left: numericNullable.default(null),
  duration_value: numericNullable.default(null),
  duration_type: nullableString,
  booking_notice_period: numericNullable.default(null),
});
export type RegiondoOption = z.infer<typeof optionSchema>;
export const optionListSchema = keyedRecord(optionSchema);

/* -------------------------------------------------------------------------- */
/* reviews                                                                    */
/* -------------------------------------------------------------------------- */

const voteSchema = z.object({
  percent: numeric,
  value: numericNullable.default(null),
  rating_code: z.string(),
});

export const reviewSchema = z.object({
  review_id: id,
  title: stringOrEmpty,
  detail: stringOrEmpty,
  nickname: stringOrEmpty,
  created_at: nullableString,
  vote_details: z.array(voteSchema).default([]),
  responses: z
    .array(z.object({ detail: stringOrEmpty, created_at: nullableString }))
    .default([]),
});
export type RegiondoReview = z.infer<typeof reviewSchema>;
export const reviewListSchema = z.array(reviewSchema);

/* -------------------------------------------------------------------------- */
/* checkout                                                                   */
/* -------------------------------------------------------------------------- */

export const totalsSchema = z.object({
  subtotal: numeric.default(0),
  grand_total: numeric.default(0),
  currency: z.string().default("EUR"),
  tax: z
    .object({ amount: numericNullable.default(null), percent: numericNullable.default(null) })
    .partial()
    .nullish(),
});
export type RegiondoTotals = z.infer<typeof totalsSchema>;

/**
 * A field the checkout form must render, as the API defines it. Driving the
 * form from this rather than from a hardcoded list is what makes the checkout
 * survive a product that suddenly requires, say, a date of birth.
 *
 * `view_type` is the semantic hint (`email`, `phone`, `first_name`); `type` is
 * the widget (`text`, `select`, `date`).
 */
export const fieldDefinitionSchema = z.object({
  field_id: id,
  title: stringOrEmpty,
  type: z.string().default("text"),
  view_type: stringOrEmpty,
  required: flag,
  value: stringOrEmpty,
  available_value_ids: z
    .array(z.object({ id: id, title: stringOrEmpty }).partial({ title: true }))
    .nullish()
    .transform((v) => v ?? []),
});
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;

export const attendeeRequirementSchema = z.object({
  attendee_number: numericNullable.default(null),
  option_id: id.nullish(),
  fields: z.array(fieldDefinitionSchema).default([]),
});

export const orderOptionFieldsSchema = z.object({
  buyer_data_required: z.array(fieldDefinitionSchema).default([]),
  attendee_data_required: z.array(attendeeRequirementSchema).default([]),
});
export type OrderOptionFields = z.infer<typeof orderOptionFieldsSchema>;

const reservationCodeSchema = z.union([
  z.string(),
  z.object({ reservation_code: z.string(), reservation_end: nullableString }),
]);

export const reservationSchema = z.object({
  reservation_data: z
    .array(reservationCodeSchema)
    .default([])
    .transform((codes) =>
      codes.map((entry) =>
        typeof entry === "string"
          ? { code: entry, endsAt: null }
          : { code: entry.reservation_code, endsAt: entry.reservation_end }
      )
    ),
  date_time: nullableString,
  totals: totalsSchema.nullish(),
  contact_data_required: z.array(z.string()).default([]),
  buyer_data_required: z.array(fieldDefinitionSchema).default([]),
  attendee_data_required: z.array(attendeeRequirementSchema).default([]),
});
export type RegiondoReservation = z.infer<typeof reservationSchema>;

export const reservationUpdateSchema = z.object({
  reservation_code: z.string().nullish(),
  reservation_end: nullableString,
});

export const checkoutTotalsSchema = z.object({
  totals: totalsSchema,
  contact_data_required: z.array(z.string()).default([]),
  buyer_data_required: z.array(fieldDefinitionSchema).default([]),
  attendee_data_required: z.array(attendeeRequirementSchema).default([]),
  payments_available: z
    .array(z.object({ code: z.string(), title: stringOrEmpty }))
    .default([]),
  discount_info: z
    .array(z.object({ title: stringOrEmpty, amount: numericNullable.default(null) }).passthrough())
    .default([]),
});
export type CheckoutTotals = z.infer<typeof checkoutTotalsSchema>;

/**
 * The payment handoff. `checkout_link` points into Regiondo's hosted
 * ticketshop, which is the only place card data is ever entered.
 */
export const checkoutLinkSchema = z.array(
  z.object({
    checkout_link: z.string().url(),
    locale: stringOrEmpty,
    currency: stringOrEmpty,
    reservation_code: stringOrEmpty,
  })
);

/**
 * A booking as returned by /supplier/bookings. This response carries full
 * customer PII for every booking on the account, so nothing here is passed to
 * a client component wholesale — `toConfirmation()` in checkout.ts picks the
 * handful of fields the confirmation page renders.
 */
export const bookingSchema = z.object({
  booking_key: z.string(),
  order_number: nullableString,
  order_id: nullableString,
  product_id: id,
  product_name: stringOrEmpty,
  ticket_name: stringOrEmpty,
  option_name: stringOrEmpty,
  variation_name: stringOrEmpty,
  event_date_time: nullableString,
  created_at: nullableString,
  qty: numeric.default(0),
  qty_cancelled: numeric.default(0),
  total_amount: numeric.default(0),
  timezone: nullableString,
  first_name: stringOrEmpty,
  last_name: stringOrEmpty,
  email: stringOrEmpty,
  phone_number: stringOrEmpty,
  sales_channel: stringOrEmpty,
  distribution_channel_partner: stringOrEmpty,
  booking_status: z.object({ code: stringOrEmpty, label: stringOrEmpty }).nullish(),
  payment_status: z.object({ code: stringOrEmpty, label: stringOrEmpty }).nullish(),
  duration_type: nullableString,
  duration_value: numericNullable.default(null),
});
export type RegiondoBooking = z.infer<typeof bookingSchema>;
export const bookingListSchema = z.array(bookingSchema);

export const accountCurrencySchema = z.array(
  z.object({
    currency_code: z.string(),
    symbol: stringOrEmpty,
    display_name: stringOrEmpty,
    is_base: flag,
  })
);

export const accountLocaleSchema = z.array(
  z.object({ locale_code: z.string(), locale_name: stringOrEmpty })
);
