import "server-only";

import { revalidateTag } from "next/cache";

/**
 * Cache tags and the revalidation vocabulary for Regiondo catalog data.
 *
 * Only catalog data is cached at all. Availability, options, totals, holds and
 * bookings are fetched fresh on every request — see D-006 in
 * docs/regiondo-build-log.md — so none of them appear here.
 *
 * TTLs live in `next.config.ts` under the `catalog` cacheLife profile:
 *
 *   stale       5 min   client-side reuse between navigations
 *   revalidate  1 hour  background refresh; products change a few times a year,
 *                       but a price edit should not take a day to appear
 *   expire      1 day   hard ceiling, so a Regiondo outage cannot serve
 *                       week-old prices indefinitely
 *
 * Those numbers are a deliberate compromise: prices and copy are edited rarely,
 * but when they *are* edited it is usually because something was wrong. An hour
 * is short enough to be forgiving and long enough that the catalog costs a
 * handful of API calls a day against the 50k/24h budget.
 */

/** Everything catalog-shaped. Busting this refetches the whole catalog. */
export const TOUR_CATALOG_TAG = "regiondo-catalog";

/** One tour. Use when a single product changes. */
export function tourCacheTag(productId: string | number): string {
  return `regiondo-tour-${productId}`;
}

/** One collection/tag. */
export function tagCacheTag(tagId: string | number): string {
  return `regiondo-collection-${tagId}`;
}

export function reviewsCacheTag(productId: string | number): string {
  return `regiondo-reviews-${productId}`;
}

/**
 * Invalidate. Called by `/api/regiondo/revalidate`, which is the endpoint to
 * point a Regiondo product webhook at.
 *
 * With no product id this flushes the whole catalog, which is the right move
 * after a bulk edit and the wrong one as a habit — it costs a fresh
 * `/products` call per page on the next request.
 */
export function revalidateCatalog(productId?: string | number): void {
  // "max" marks the entry stale and serves it while refetching in the
  // background, which is what you want for a catalog: a webhook burst must not
  // turn every tour page into a blocking cache miss at once.
  if (productId !== undefined) {
    revalidateTag(tourCacheTag(productId), "max");
    revalidateTag(reviewsCacheTag(productId), "max");
  }
  revalidateTag(TOUR_CATALOG_TAG, "max");
}
