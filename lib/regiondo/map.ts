import "server-only";

import { brandize } from "@/lib/brand";

import { sanitizeHtml, sanitizeHtmlOrNull, stripTags, truncate } from "./sanitize";
import type {
  RegiondoOption,
  RegiondoProductDetail,
  RegiondoProductListItem,
  RegiondoPurchase,
  RegiondoReview,
} from "./schemas";
import { slugForProductId, tourHref } from "./slugs";
import type {
  ConfirmedBooking,
  TourDetail,
  TourDuration,
  TourImage,
  TourOption,
  TourPrice,
  TourRating,
  TourReview,
  TourSummary,
} from "./types";

/**
 * Raw-shape to domain-shape mapping. Everything a component touches is built
 * here, so the components themselves never see a Regiondo field name.
 */

/**
 * Regiondo's `rating_summary` is a percentage (100 = five stars), which is a
 * Magento inheritance. Everything downstream — the star component, JSON-LD's
 * `AggregateRating` — works in 0–5.
 */
function toRating(percent: number | null, count: number | null): TourRating | null {
  if (percent === null || !count) return null;
  return { value: Math.round((percent / 20) * 10) / 10, count };
}

function toDuration(value: number | null, type: string | null): TourDuration | null {
  if (!value || !type) return null;
  const unit = type === "day" ? "day" : type === "minute" ? "minute" : "hour";
  const rounded = Math.round(value * 10) / 10;
  const noun = rounded === 1 ? unit : `${unit}s`;
  return { value: rounded, unit, label: `${rounded} ${noun}` };
}

/**
 * Regiondo's CDN only renders `-cropped600-400` and `-thumbnail-360x240`; the
 * bare filename and any larger crop 404. So the "full size" image genuinely is
 * 600×400 — see the image note in docs/regiondo-build-log.md.
 */
function toImage(url: string | null, thumbnail: string | null, alt: string): TourImage | null {
  if (!url) return null;
  return { url, thumbnailUrl: thumbnail ?? url, alt };
}

function toPrice(amount: number, was: number | null, currency: string): TourPrice {
  return {
    amount,
    // Only a genuine reduction is a strike-through. The API sets
    // original_price === base_price when nothing is discounted.
    wasAmount: was !== null && was > amount ? was : null,
    currency: currency || "EUR",
  };
}

function splitList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toTourSummary(raw: RegiondoProductListItem): TourSummary {
  const title = brandize(raw.name);
  const excerpt = truncate(stripTags(raw.short_description || raw.description), 180);

  return {
    id: raw.product_id,
    slug: slugForProductId(raw.product_id),
    href: tourHref(raw.product_id),
    title,
    excerpt,
    image: toImage(raw.image ?? raw.thumbnail, raw.small_image ?? raw.thumbnail, title),
    priceFrom: toPrice(raw.base_price, raw.original_price, raw.currency_code),
    rating: toRating(raw.rating_summary, raw.reviews_count),
    duration: toDuration(raw.duration_values, raw.duration_type),
    city: raw.city,
    languages: splitList(raw.language_titles),
    collections: splitList(raw.category_titles),
    needsAppointment: raw.is_appointment_needed,
    updatedAt: raw.updated_at,
  };
}

/**
 * `ticket_highlights` is newline-separated plain text, not HTML and not a list.
 * Bullets in the source are inconsistent, so leading markers are trimmed.
 */
function toHighlights(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-*–—]+/, "").trim())
    .filter((line) => line.length > 1);
}

export function toTourDetail(raw: RegiondoProductDetail): TourDetail {
  const summary = toTourSummary(raw as unknown as RegiondoProductListItem);
  const title = summary.title;

  const gallery = raw.image_sort_order.length
    ? [...raw.image_sort_order]
        .sort((a, b) => a.position - b.position)
        .map((entry, index) => ({
          url: entry.url,
          thumbnailUrl: entry.thumbnail_url ?? entry.url,
          alt: entry.label || `${title} — photo ${index + 1}`,
        }))
    : raw.image_url.map((url, index) => ({
        url,
        thumbnailUrl: url,
        alt: `${title} — photo ${index + 1}`,
      }));

  return {
    ...summary,
    image: gallery[0] ?? summary.image,
    descriptionHtml: sanitizeHtml(raw.description || raw.short_description),
    highlights: toHighlights(raw.ticket_highlights),
    includedHtml: sanitizeHtmlOrNull(raw.faq_included),
    notIncludedHtml: sanitizeHtmlOrNull(raw.faq_not_included),
    bringHtml: sanitizeHtmlOrNull(raw.faq_customer_requirements),
    otherInfoHtml: sanitizeHtmlOrNull(raw.faq_other_info),
    importantInfoHtml: sanitizeHtmlOrNull(raw.important_info),
    participantsHtml: sanitizeHtmlOrNull(raw.faq_participants),
    gallery,
    variations: raw.variations.map((v) => ({
      id: v.variation_id,
      name: brandize(v.name),
      appointmentType: v.appointment_type,
      from: v.from,
      to: v.to,
    })),
    meetingPoint: {
      name: raw.location_name,
      address: raw.location_address,
      info: stripTags(raw.location_specific_info) || null,
      lat: raw.geo_lat,
      lon: raw.geo_lon,
    },
    timezone: raw.timezone ?? "Europe/Rome",
    bookingNoticeHours: raw.booking_notice_period ?? 0,
    provider: brandize(raw.provider),
    // meta_description comes back wrapped in <p>, which would render literally
    // in a <meta> tag.
    metaTitle: brandize(raw.meta_title),
    metaDescription: stripTags(raw.meta_description) || null,
    createdAt: raw.created_at,
  };
}

export function toTourOption(raw: RegiondoOption, currency: string): TourOption {
  return {
    id: raw.option_id,
    variationId: raw.variation_id,
    name: brandize(raw.name),
    description: stripTags(raw.description),
    price: toPrice(raw.regiondo_price, raw.original_price, currency),
    minPerOrder: Math.max(0, raw.min_qty_to_sell),
    maxPerOrder: Math.max(0, raw.max_qty_to_sell),
    seatsLeft: raw.qty_left,
    sortOrder: raw.sort_order ?? 0,
  };
}

export function toTourReview(raw: RegiondoReview): TourReview {
  const overall =
    raw.vote_details.find((v) => v.rating_code === "Overall rating") ?? raw.vote_details[0];

  return {
    id: raw.review_id,
    title: stripTags(raw.title),
    body: stripTags(raw.detail),
    author: stripTags(raw.nickname) || "Guest",
    createdAt: raw.created_at,
    rating: overall ? (overall.value ?? Math.round(overall.percent / 20)) : null,
    response: raw.responses[0] ? stripTags(raw.responses[0].detail) || null : null,
  };
}

/**
 * j***@example.com — enough for a customer to recognise their own address, not
 * enough to harvest. The mask is a fixed width rather than one asterisk per
 * character, both because the length is itself a small leak and because some
 * real addresses (OTA relay addresses in particular) are long enough to wrap
 * the line.
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "";
  return `${local.slice(0, 1)}${"*".repeat(4)}@${domain}`;
}

/**
 * Narrow a verified purchase down to what the confirmation page shows.
 *
 * This is the choke point for order data: whatever it does not return cannot
 * reach a component. Ticket PDF links are dropped deliberately — the page can
 * be reached with an order number alone, and a signed link to someone's ticket
 * is not something an order number should unlock. Tickets go by email.
 */
export function toConfirmedBooking(raw: RegiondoPurchase): ConfirmedBooking {
  return {
    orderNumber: raw.order_number,
    purchasedAt: raw.purchased_at,
    items: raw.items.map((item) => ({
      productId: item.product_id,
      productName: item.ticket_name,
      optionName: item.ticket_option,
      variationName: item.ticket_variation,
      eventDateTime: item.event_date_time,
      // Cancelled tickets stay on the order; show what the customer still has.
      quantity: Math.max(0, item.ticket_qty - item.ticket_qty_canceled),
      unitPrice: item.price_per_one_incl_tax,
      lineTotal: item.row_total_incl_tax,
      statusLabel: item.status,
    })),
    total: raw.grand_total,
    taxAmount: raw.tax_amount,
    currency: raw.currency,
    paymentStatusLabel: raw.payment_status?.label ?? "",
    salesChannel: raw.sales_channel,
    maskedEmail: maskEmail(raw.contact_data?.email ?? ""),
  };
}
