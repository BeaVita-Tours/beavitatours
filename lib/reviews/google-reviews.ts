import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Review } from "./types";

/**
 * # Live Google Reviews
 *
 * Fetches the aggregate rating, total review count, and up to 5 recent reviews
 * for the business via the Google **Places API (v1)**. This is the only review
 * source that's truly live — TripAdvisor and GetYourGuide are hardcoded
 * statics (see `platform-stats.ts`).
 *
 * ## Service Area Businesses (SABs)
 * BEA VITA Tours is a Service Area Business — Google hides its physical address
 * and the old Place Details API excluded SABs entirely, which is why this used
 * to fall back to manual reviews. The v1 Places API now finds them:
 * `places:searchText` with `includePureServiceAreaBusinesses: true` returns the
 * listing and its reviews. That's our default lookup.
 *
 * ## How the business is looked up
 * Two ways, in order of preference:
 *  1. **`GOOGLE_PLACE_ID`** (optional) — fetch that specific place directly.
 *     Deterministic; use it whenever you already have a stable place ID.
 *  2. **`GOOGLE_PLACES_QUERY`** (required when no place ID) — the business's
 *     display name (e.g. "BEA VITA Tours"), queried via `places:searchText`
 *     with SABs included. This is the path that finds a Service Area Business
 *     like ours.
 * At least one is required. With neither set — or on any failure —
 * `getGoogleReviews()` returns `null` and the section renders static badges +
 * manual reviews only; the build never breaks.
 *
 * ## Getting the credentials
 * 1. **API key** — Google Cloud Console → enable the **Places API** →
 *    Credentials → Create API key. Put it in `.env.local` as
 *    `GOOGLE_PLACES_API_KEY`. (Server-only — never prefix with
 *    `NEXT_PUBLIC_`.)
 * 2. **Place ID or query** — for a place ID, copy the business's `?cid=` /
 *    `place_id` from its Google Maps share link. For a query, put its display
 *    name in `GOOGLE_PLACES_QUERY`. Either works; the query is what finds a
 *    Service Area Business.
 *
 * ## Revalidation (ISR)
 * This function is `"use cache"` with the `reviews` cache-life profile, which
 * revalidates at most every 6 hours in the background. **To change the
 * interval, edit the `reviews` block in `next.config.ts`** — that's the single
 * place to tune it.
 *
 * ## Known limitation
 * Google only returns the **most recent 5 reviews** per request. We design
 * around that (5 live reviews merged with manual ones) rather than trying to
 * assemble a larger pool.
 */

const PLACES_API_URL = "https://places.googleapis.com/v1";

// The Place fields we read. Reused by both endpoints: the direct place fetch
// uses bare names, while searchText prefixes each with `places.`.
const PLACE_FIELDS = [
  "id",
  "displayName",
  "googleMapsUri",
  "rating",
  "userRatingCount",
  "reviews",
] as const;

const PLACE_ID_FIELD_MASK = PLACE_FIELDS.join(",");
const SEARCH_TEXT_FIELD_MASK = PLACE_FIELDS.map((f) => `places.${f}`).join(",");

// Read env at module scope (server-only, mirrors lib/sanity/client.ts). A
// missing value makes every fetch short-circuit before any network I/O.
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || undefined;
const GOOGLE_PLACES_QUERY = process.env.GOOGLE_PLACES_QUERY || undefined;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || undefined;

export const isGoogleReviewsConfigured = Boolean(
  GOOGLE_PLACES_API_KEY && (GOOGLE_PLACE_ID || GOOGLE_PLACES_QUERY),
);

export interface GoogleReviewsResult {
  rating: number;
  totalCount: number;
  /** The business's Google Maps page, returned by the API — linked from the badge. */
  url: string;
  reviews: Review[];
}

/** A single review as returned by the v1 Places API. */
interface GooglePlacesReview {
  /** Resource name, e.g. "places/{placeId}/reviews/{reviewId}" — stable + unique. */
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  /** RFC 3339 timestamp, e.g. "2026-05-19T19:25:36.893092987Z". */
  publishTime?: string;
  authorAttribution?: { displayName?: string; photoUri?: string };
  googleMapsUri?: string;
}

/** Minimal shape of a v1 Place (shared by both endpoint responses). */
interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlacesReview[];
}

/** Response of `places:searchText` — wraps the list of matching places. */
interface GoogleSearchTextResponse {
  places?: GooglePlace[];
}

/** Normalize a display name for case- and whitespace-insensitive comparison. */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * From a search-text result list, pick the place that matches the query. A
 * name search can return similarly-named businesses, and we must never badge
 * the wrong one: an exact normalized-name match wins, otherwise the first
 * (Google's highest-ranked) result is used.
 */
function pickBestPlace(places: GooglePlace[]): GooglePlace | null {
  if (places.length <= 1) return places[0] ?? null;

  const query = normalizeName(GOOGLE_PLACES_QUERY ?? "");
  return (
    places.find(
      (p) => query !== "" && normalizeName(p.displayName?.text ?? "") === query,
    ) ?? places[0]
  );
}

/**
 * Fetch a single place's live data. Uses the place ID when set (deterministic);
 * otherwise searches by the business-name query with SABs included — the path
 * that finds a Service Area Business.
 */
async function fetchGooglePlace(
  signal: AbortSignal,
): Promise<GooglePlace | null> {
  if (GOOGLE_PLACE_ID) {
    const res = await fetch(
      `${PLACES_API_URL}/places/${encodeURIComponent(GOOGLE_PLACE_ID)}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": PLACE_ID_FIELD_MASK,
        },
        signal,
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as GooglePlace;
  }

  const res = await fetch(`${PLACES_API_URL}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": SEARCH_TEXT_FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: GOOGLE_PLACES_QUERY,
      // Critical: without this, Service Area Businesses are excluded from the
      // results entirely — which is exactly what broke this review section.
      includePureServiceAreaBusinesses: true,
      maxResultCount: 5,
    }),
    signal,
  });
  if (!res.ok) return null;

  const data = (await res.json()) as GoogleSearchTextResponse;
  return pickBestPlace(data.places ?? []);
}

// Only this rating or higher is surfaced as a review card. The aggregate badge
// still shows the real `rating` / `userRatingCount` — we curate the quoted text,
// never the numbers.
const MIN_QUOTED_RATING = 5;

/**
 * Map a v1 Place (from either endpoint) into the normalized result. Returns
 * `null` when the place has no numeric rating yet — a count without a rating
 * should not render as a 0-star card.
 */
function toGoogleReviewsResult(place: GooglePlace): GoogleReviewsResult | null {
  if (typeof place.rating !== "number") return null;

  const reviews: Review[] = (place.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= MIN_QUOTED_RATING)
    .map((r) => {
      const authorName = r.authorAttribution?.displayName ?? "Google User";
      return {
        id: r.name
          ? `google:${r.name.split("/").pop()}`
          : `google:${authorName}:${r.publishTime ?? "unknown"}`,
        source: "google" as const,
        authorName,
        authorPhotoUrl: r.authorAttribution?.photoUri,
        rating: r.rating ?? 0,
        text: r.text?.text ?? r.originalText?.text ?? "",
        // Reviews come back newest-first; keep timestamps stable for sorting.
        date: r.publishTime
          ? new Date(r.publishTime).toISOString()
          : "1970-01-01T00:00:00.000Z",
        sourceUrl: r.googleMapsUri,
      };
    });

  return {
    rating: place.rating,
    totalCount: place.userRatingCount ?? 0,
    url: place.googleMapsUri ?? "",
    reviews,
  };
}

export async function getGoogleReviews(): Promise<GoogleReviewsResult | null> {
  "use cache";
  cacheLife("reviews");
  cacheTag("reviews");

  if (!isGoogleReviewsConfigured) return null;

  try {
    // 8s timeout so a slow/failing API can never hang a static build's
    // cache-fill for the default ~50s.
    const place = await fetchGooglePlace(AbortSignal.timeout(8000));
    return place ? toGoogleReviewsResult(place) : null;
  } catch {
    // Network / parse error → caller falls back to manual reviews only.
    return null;
  }
}
