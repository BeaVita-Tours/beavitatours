import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { request, tryRequest } from "./client";
import { COLLECTIONS } from "./collections";
import { getConfig } from "./config";
import { toTourDetail, toTourOption, toTourReview, toTourSummary } from "./map";
import {
  availabilitySchema,
  optionListSchema,
  productDetailSchema,
  productListSchema,
  reviewListSchema,
  timeslotListSchema,
  tagListSchema,
} from "./schemas";
import { productIdForSlug } from "./slugs";
import { reviewsCacheTag, tagCacheTag, tourCacheTag, TOUR_CATALOG_TAG } from "./cache";
import type {
  TourAvailability,
  TourCollection,
  TourDetail,
  TourOption,
  TourReview,
  TourSlot,
  TourSummary,
} from "./types";

/**
 * Product/catalog API wrapper.
 *
 * Split by cacheability, which on this API is the same split as "does it
 * represent inventory":
 *
 *   cached    /tags, /products, /products/{id}, /reviews
 *   uncached  /products/availabilities, /products/availoptions
 *
 * The cached half uses `"use cache"` with the `catalog` profile and per-entity
 * tags, so a Regiondo webhook (or a manual POST to /api/regiondo/revalidate)
 * can bust one tour without flushing the catalog.
 */

export interface CatalogFilters {
  /** Regiondo tag id — the account's real categories. */
  readonly tag?: string;
  readonly productIds?: readonly string[];
  readonly search?: string;
  readonly languageIds?: readonly string[];
  readonly priceMax?: number;
  readonly priceMin?: number;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly sort?: CatalogSort;
  readonly limit?: number;
  readonly offset?: number;
}

export type CatalogSort = "popular" | "price_asc" | "price_desc" | "duration_asc" | "duration_desc";

/** Sorts the API can do server-side. Duration is ours — see below. */
const API_SORTS: Partial<Record<CatalogSort, string>> = {
  popular: "relevance",
  price_asc: "price_asc",
  price_desc: "price_desc",
};

export interface CatalogResult {
  readonly tours: readonly TourSummary[];
  readonly total: number;
  /** True when Regiondo was unreachable and this is a fallback render. */
  readonly degraded: boolean;
}

/**
 * The account's browsable categories. These come from `/tags`, not
 * `/categories` — the latter is Regiondo's global marketplace taxonomy
 * (Leisure Activities, Sport, …) and has nothing to do with this catalog.
 */
export async function getCollections(): Promise<readonly TourCollection[]> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG);

  const { data } = await tryRequest("/tags", { schema: tagListSchema, params: { limit: 250 } }, []);

  return data.map((tag) => ({
    id: tag.tag_id,
    slug: tag.url_key,
    title: tag.name,
    // The collection page for this tag, if we have one; the catalog index
    // that used to take `?collection=` is gone.
    href:
      Object.values(COLLECTIONS).find((c) => c.tagId === tag.tag_id)?.href ??
      COLLECTIONS.shared.href,
  }));
}

/**
 * Fetch the catalog.
 *
 * Filtering and sorting go to the API wherever it supports them. Two do not,
 * and are applied here over the returned page:
 *
 *  - **duration**: not a filter or a sort on /products, though it is a product
 *    field. With eleven products the post-filter is free; if this catalog grows
 *    past a page it needs revisiting.
 *  - **price range**: /products has a `price` param but the spec does not
 *    document its format, and guessing at an undocumented parameter is exactly
 *    what the brief rules out. Filtering on the parsed `base_price` is exact.
 */
export async function listTours(filters: CatalogFilters = {}): Promise<CatalogResult> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG);
  if (filters.tag) cacheTag(tagCacheTag(filters.tag));

  const limit = Math.min(filters.limit ?? 50, 250);

  const params: Record<string, string | number> = {
    active_only: "true",
    limit,
    offset: filters.offset ?? 0,
    attribute_include_type: "all",
  };

  if (filters.tag) params.tag = filters.tag;
  if (filters.productIds?.length) params.product_ids = filters.productIds.join(",");
  if (filters.search) {
    params.kwd = filters.search;
    params.kwd_condition = "AND";
  }
  if (filters.languageIds?.length) params.ticket_languages = filters.languageIds.join(",");
  if (filters.dateFrom && filters.dateTo) params.date_range = `${filters.dateFrom},${filters.dateTo}`;

  const apiSort = filters.sort ? API_SORTS[filters.sort] : undefined;
  if (apiSort) params.sort_by = apiSort;

  const { data, degraded } = await tryRequest(
    "/products",
    { schema: productListSchema, params },
    []
  );

  let tours = data.map(toTourSummary);

  if (filters.priceMin !== undefined) {
    tours = tours.filter((t) => t.priceFrom.amount >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    tours = tours.filter((t) => t.priceFrom.amount <= filters.priceMax!);
  }

  if (filters.sort === "duration_asc" || filters.sort === "duration_desc") {
    const direction = filters.sort === "duration_asc" ? 1 : -1;
    tours = [...tours].sort((a, b) => {
      // Tours with no stated duration sort last either way, rather than
      // clumping at the top because 0 < everything.
      const av = a.duration ? toHours(a.duration.value, a.duration.unit) : Number.POSITIVE_INFINITY;
      const bv = b.duration ? toHours(b.duration.value, b.duration.unit) : Number.POSITIVE_INFINITY;
      if (av === bv) return 0;
      if (!Number.isFinite(av)) return 1;
      if (!Number.isFinite(bv)) return -1;
      return (av - bv) * direction;
    });
  }

  return { tours, total: tours.length, degraded };
}

function toHours(value: number, unit: "hour" | "day" | "minute"): number {
  return unit === "day" ? value * 24 : unit === "minute" ? value / 60 : value;
}

/** Every active product. Used by the sitemap and by generateStaticParams. */
export async function listAllTours(): Promise<readonly TourSummary[]> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG);
  const { tours } = await listTours({ limit: 250 });
  return tours;
}

export async function getTour(productId: string): Promise<TourDetail | null> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG, tourCacheTag(productId));

  const { data, degraded } = await tryRequest(
    `/products/${encodeURIComponent(productId)}`,
    { schema: productDetailSchema },
    null as never
  );

  if (degraded || !data) return null;
  return toTourDetail(data);
}

export async function getTourBySlug(slug: string): Promise<TourDetail | null> {
  const productId = productIdForSlug(slug);
  if (!productId) return null;
  return getTour(productId);
}

/**
 * Reviews for a tour. Genuine customer reviews from Regiondo, which is what
 * makes `AggregateRating` in the tour page's JSON-LD legitimate — for the
 * products that have them. Products with none get no rating markup at all.
 *
 * Ordered best-first: by score, then newest. The API returns them newest
 * first, which put a 3-star review at the top of a 4.5-star tour purely on
 * date. Nothing is dropped — lower scores follow the higher ones, so the
 * aggregate stays honest and the list is easy to scan.
 */
export async function getTourReviews(productId: string, limit = 12): Promise<readonly TourReview[]> {
  "use cache";
  cacheLife("catalog");
  cacheTag(reviewsCacheTag(productId));

  const { data } = await tryRequest(
    "/reviews",
    { schema: reviewListSchema, params: { product_id: productId, limit } },
    []
  );

  return sortReviewsBestFirst(data.map(toTourReview).filter((review) => review.body.length > 0));
}

export function sortReviewsBestFirst(reviews: readonly TourReview[]): TourReview[] {
  return [...reviews].sort(
    (a, b) =>
      (b.rating ?? 0) - (a.rating ?? 0) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );
}

/**
 * Related tours: same collection, excluding this one. Falls back to the rest of
 * the catalog so the section is never empty on an untagged product (two of the
 * eleven are untagged today).
 */
export async function getRelatedTours(
  productId: string,
  collectionTitle: string | null,
  limit = 3
): Promise<readonly TourSummary[]> {
  "use cache";
  cacheLife("catalog");
  cacheTag(TOUR_CATALOG_TAG);

  const all = await listAllTours();
  const others = all.filter((tour) => tour.id !== productId);
  const sameCollection = collectionTitle
    ? others.filter((tour) => tour.collections.includes(collectionTitle))
    : [];

  const pool = sameCollection.length >= limit ? sameCollection : [...sameCollection, ...others];
  const seen = new Set<string>();
  return pool
    .filter((tour) => (seen.has(tour.id) ? false : (seen.add(tour.id), true)))
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* live inventory — never cached                                              */
/* -------------------------------------------------------------------------- */

/**
 * Bookable dates and start times for a variation.
 *
 * No `"use cache"`, and `cache: "no-store"` on the fetch: this is inventory. A
 * cached calendar that shows a sold-out date as bookable produces a hold
 * failure at the worst possible moment in the funnel.
 */
export async function getAvailability(
  variationId: string,
  from: string,
  to: string
): Promise<TourAvailability> {
  if (!getConfig().enabled) return {};

  try {
    return await request(`/products/availabilities/${encodeURIComponent(variationId)}`, {
      schema: availabilitySchema,
      params: { dt_from: from, dt_to: to, show_soldout: "false" },
      cache: "no-store",
    });
  } catch {
    // An empty calendar renders as "no dates available", which is the safe
    // failure: it cannot sell something that might not exist.
    return {};
  }
}

/**
 * Participant tiers and their live seat counts for a specific slot.
 *
 * `time` must be `HH:MM`. The availability endpoint hands back `HH:MM:SS` and
 * this one rejects that with a 400, so the seconds are trimmed here rather than
 * at every call site.
 */
export async function getOptions(
  variationId: string,
  date?: string,
  time?: string
): Promise<readonly TourOption[]> {
  if (!getConfig().enabled) return [];

  const params: Record<string, string> = {};
  if (date) params.date = date;
  if (time) params.time = time.slice(0, 5);

  try {
    const raw = await request(`/products/availoptions/${encodeURIComponent(variationId)}`, {
      schema: optionListSchema,
      params,
      cache: "no-store",
    });
    return raw
      .map((option) => toTourOption(option, getConfig().currency))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [];
  }
}

/**
 * The departure's own seat count, which is what actually limits a booking —
 * see `timeslotSchema`. Returns null when the endpoint is unavailable or the
 * slot is not in its answer; the caller then falls back to per-option stock.
 */
export async function getSlotCapacity(
  variationId: string,
  date: string,
  time: string
): Promise<{ seatsLeft: number | null; byOption: Readonly<Record<string, number>> } | null> {
  if (!getConfig().enabled) return null;

  const wanted = `${date} ${time.slice(0, 5)}`;
  try {
    const slots = await request("/products/timeslots", {
      schema: timeslotListSchema,
      params: {
        regiondo_variation_id: variationId,
        from_datetime: `${date} 00:00:00`,
        to_datetime: `${date} 23:59:59`,
      },
      cache: "no-store",
    });
    const slot = slots.find((candidate) => candidate.start_date_time.startsWith(wanted));
    if (!slot) return null;
    return {
      seatsLeft: slot.is_available === 0 ? 0 : slot.qty_available,
      byOption: slot.qty_available_by_option,
    };
  } catch {
    return null;
  }
}

/**
 * Everything the panel needs for one departure, in one call: the tiers with
 * their stock capped at what the departure really has left, and that shared
 * number itself. The two upstream reads run in parallel.
 */
export async function getSlot(variationId: string, date: string, time: string): Promise<TourSlot> {
  const [options, capacity] = await Promise.all([
    getOptions(variationId, date, time),
    getSlotCapacity(variationId, date, time),
  ]);

  if (!capacity) return { options, seatsLeft: null };

  const capped = options.map((option) => {
    const limits = [option.seatsLeft, capacity.byOption[option.id], capacity.seatsLeft].filter(
      (value): value is number => value !== null && value !== undefined
    );
    return limits.length > 0 ? { ...option, seatsLeft: Math.min(...limits) } : option;
  });

  return { options: capped, seatsLeft: capacity.seatsLeft };
}

export { TOUR_CATALOG_TAG, reviewsCacheTag, tagCacheTag, tourCacheTag };
