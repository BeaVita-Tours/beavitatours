import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Review } from "./types";

/**
 * # Live Google Reviews
 *
 * Fetches the aggregate rating, total review count, and up to 5 recent reviews
 * for the business via the Google **Places API** (legacy Place Details
 * endpoint). This is the only review source that's truly live — TripAdvisor
 * and GetYourGuide are hardcoded statics (see `platform-stats.ts`).
 *
 * ## Getting the credentials
 * 1. **API key** — Google Cloud Console → enable the **Places API** →
 *    Credentials → Create API key. Put it in `.env.local` as
 *    `GOOGLE_PLACES_API_KEY`. (Server-only — never prefix with
 *    `NEXT_PUBLIC_`.)
 * 2. **Place ID** — search the business on Google Maps, then either use its
 *    share link (`https://maps.google.com/?cid=…` → `place_id` from the URL),
 *    or run a `place/findplacefromtext` request. Put it in `.env.local` as
 *    `GOOGLE_PLACE_ID`.
 *
 * With no credentials set, `getGoogleReviews()` returns `null` and the section
 * renders the static badges + manual reviews only — the build never breaks.
 *
 * ## Revalidation (ISR)
 * This function is `"use cache"` with the `reviews` cache-life profile, which
 * revalidates at most every 6 hours in the background. **To change the
 * interval, edit the `reviews` block in `next.config.ts`** — that's the single
 * place to tune it.
 *
 * ## Known limitation
 * Google only returns the **most recent 5 reviews** per Place Details request.
 * We design around that (5 live reviews merged with manual ones) rather than
 * trying to assemble a larger pool.
 */

// Read env at module scope (server-only, mirrors lib/sanity/client.ts). A
// missing value makes every fetch short-circuit before any network I/O.
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export const isGoogleReviewsConfigured = Boolean(
  GOOGLE_PLACE_ID && GOOGLE_PLACES_API_KEY,
);

/** Google Maps place page, built from the Place ID. Linked from the live badge. */
export const GOOGLE_REVIEWS_URL = isGoogleReviewsConfigured
  ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(GOOGLE_PLACE_ID!)}`
  : null;

export interface GoogleReviewsResult {
  rating: number;
  totalCount: number;
  reviews: Review[];
}

/** Minimal shape of the legacy Place Details JSON response. */
interface GooglePlaceDetailsResponse {
  status: string;
  error_message?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name: string;
      profile_photo_url?: string;
      rating: number;
      text: string;
      time: number;
    }>;
  };
}

export async function getGoogleReviews(): Promise<GoogleReviewsResult | null> {
  "use cache";
  cacheLife("reviews");
  cacheTag("reviews");

  if (!isGoogleReviewsConfigured) return null;

  try {
    const params = new URLSearchParams({
      place_id: GOOGLE_PLACE_ID!,
      fields: "name,rating,user_ratings_total,reviews",
      key: GOOGLE_PLACES_API_KEY!,
    });
    // 8s timeout so a slow/failing API can never hang a static build's
    // cache-fill for the default ~50s.
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as GooglePlaceDetailsResponse;
    // Non-"OK" covers REQUEST_DENIED, OVER_QUERY_LIMIT, NOT_FOUND, etc.
    if (data.status !== "OK" || !data.result) return null;
    // A new place can have a count but no rating yet — don't render a 0-star card.
    if (typeof data.result.rating !== "number") return null;

    const reviews: Review[] = (data.result.reviews ?? []).map((r) => ({
      id: `google:${r.author_name}:${r.time}`,
      source: "google" as const,
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      date: new Date(r.time * 1000).toISOString(),
      authorPhotoUrl: r.profile_photo_url,
    }));

    return {
      rating: data.result.rating,
      totalCount: data.result.user_ratings_total ?? 0,
      reviews,
    };
  } catch {
    // Network / parse error → caller falls back to manual reviews only.
    return null;
  }
}
