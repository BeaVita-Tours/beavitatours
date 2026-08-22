import type { Review } from "./types";

/**
 * # Manual reviews — add reviews from any platform here
 *
 * This is the low-friction way to feature specific reviews on the homepage
 * without a CMS or database. Every entry uses the same `Review` type as the
 * live Google reviews, so hand-added reviews merge into the same date-sorted
 * scrollable row.
 *
 * ## How to add a review
 *
 * Copy one of the example objects below, paste it into the `manualReviews`
 * array, and fill in the real values:
 *
 * ```ts
 * {
 *   id: "facebook-1",                 // any unique string
 *   source: "manual",                 // always "manual" for hand-added reviews
 *   platformLabel: "Facebook",        // the real platform name — shown on the card
 *   authorName: "Sarah M.",           // display name
 *   rating: 5,                        // 1–5
 *   text: "One of the best days of our trip! Bea was an incredible host...",
 *   date: "2026-06-02T15:30:00.000Z", // full ISO timestamp (see note below)
 *   sourceUrl: "https://facebook.com/...", // optional link to the original review
 * },
 * ```
 *
 * ```ts
 * {
 *   id: "yelp-1",
 *   source: "manual",
 *   platformLabel: "Yelp",
 *   authorName: "Dario",
 *   rating: 5,
 *   text: "Perfect day trip from Venice...",
 *   date: "2026-04-18T09:00:00.000Z",
 * },
 * ```
 *
 * ## Notes
 * - `id` must be unique across all entries (Google reviews use
 *   `google:<author>:<timestamp>`, so a `manual-*` / `facebook-*` prefix avoids
 *   collisions).
 * - `date` MUST be a full ISO timestamp (include a time and the `Z`), not a
 *   bare `YYYY-MM-DD`. The merged list is sorted by comparing these strings
 *   lexicographically, and a bare date would sort before same-day timestamps.
 * - `text` may be empty for a rating-only review — the card simply omits it.
 * - This file is compiled into the client bundle, so keep author names to a
 *   display name only (no personal data beyond what you'd show publicly).
 */

// ─── PLACEHOLDERS ─────────────────────────────────────────────────────────────
// Replace these with the client's real reviews before publishing. Everything in
// brackets is template text. Once Google reviews are fetched (see
// google-reviews.ts), live reviews merge into this same row.
// Delete a placeholder by removing its object; add real ones by copying the
// header example and filling it in. `id` must be unique.
export const manualReviews: Review[] = [
  {
    id: "manual-1",
    source: "manual",
    platformLabel: "GetYourGuide",
    authorName: "Tommy",
    rating: 5,
    text: "Carlo was great!!! We enjoyed seeing key sites in the Dolomites and Carlo’s friendliness.",
    date: "2026-08-19T10:00:00.000Z",
  },
  {
    id: "manual-2",
    source: "manual",
    platformLabel: "Civitatis",
    authorName: "Marta",
    rating: 5,
    text: "Excellent excursion to the Dolomites. Our guide Chiara was wonderful; she taught us history and interesting facts about the beautiful places we saw on this excursion. Highly recommended if you spend a few days in Venice; unique landscapes worth seeing.",
    date: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "manual-3",
    source: "manual",
    platformLabel: "viator",
    authorName: "Brooke A.",
    rating: 5,
    text: "It was a fantastic day: the perfect balance of relaxation and activity. Our host and guide, Massimo, was truly lovely. You could tell he loves sharing facts and history about his beautiful country with travelers from all over the world. He was very helpful and a genuinely fun person to spend the day with. We loved the incredible scenery everywhere we turned, riding the fun bobsleds down the mountain, and I loved sampling fresh local cheeses with Massimo! I would definitely recommend this trip to anyone interested in a quick trip to the Dolomites from Venice. 15/10!",
    date: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "manual-4",
    source: "manual",
    platformLabel: "viator",
    authorName: "Samantha D.",
    rating: 5,
    text: "This trip was quite literally a breath of fresh air. With it being so hot in July, it was a perfect getaway from the humidity and the views were insane. Chiara our guide was awesome, super informative and made it fun. Our driver was great and the bus was comfy and had great AC. We did the chairlift to the top of one mountain, highly recommend",
    date: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "manual-5",
    source: "manual",
    platformLabel: "TripAdvisor",
    authorName: "AJS707",
    rating: 5,
    text: "Marco was a fabulous tour guide. He had a wealth of knowledge about the entire area. The lakes and villages we visited along the way were absolutely stunning. Hiking around the lakes was also a bonus. Cortina is the most commercial stop, but also a must-see given that it will host the 2026 Winter Olympics. It was a busy day, but we never felt rushed and were able to admire the beauty of nature.",
    date: "2026-08-01T10:00:00.000Z",
  },
];
