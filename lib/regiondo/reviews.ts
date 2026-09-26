import type { Review } from "@/lib/reviews/types";

import type { TourReview } from "./types";

/**
 * Adapts a Regiondo tour review to the site-wide `Review` shape, so the tour
 * page can render the same `ReviewCard` / `ReviewInspector` as the homepage
 * instead of a second card design.
 *
 * `TourReview` stays the canonical Regiondo type — the JSON-LD builder and the
 * catalog rating still read it directly — this is only the presentation
 * bridge.
 */
export function toReview(review: TourReview): Review | null {
  // A star row is part of the card; a review with no score at all (no vote
  // details came back) has nowhere honest to sit, so it is left out.
  if (review.rating === null) return null;

  return {
    id: `regiondo:${review.id}`,
    source: "regiondo",
    authorName: review.author,
    rating: review.rating,
    ...(review.title ? { title: review.title } : {}),
    text: review.body,
    date: toIsoDate(review.createdAt),
    ...(review.response ? { ownerResponse: review.response } : {}),
  };
}

export function toReviews(reviews: readonly TourReview[]): Review[] {
  return reviews.map(toReview).filter((review): review is Review => review !== null);
}

/**
 * Regiondo returns "2026-08-29 08:04:10", which `new Date()` parses as local
 * time in Node and — historically — inconsistently in browsers. Pinning it to
 * UTC keeps the server and client HTML identical; a missing timestamp becomes
 * an empty string, which the card header treats as "no date".
 */
function toIsoDate(raw: string | null): string {
  if (!raw) return "";
  const parsed = new Date(`${raw.replace(" ", "T")}Z`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}
