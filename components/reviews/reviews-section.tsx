import { cacheLife } from "next/cache";
import { getGoogleReviews } from "@/lib/reviews/google-reviews";
import { manualReviews } from "@/lib/reviews/manual-reviews";
import { alsoRatedOnStats, headlineStats } from "@/lib/reviews/platform-stats";
import type { Review } from "@/lib/reviews/types";
import { ReviewStatsBadge } from "./review-stats-badge";
import { ReviewsMarquee } from "./reviews-marquee";

/** Newest first. ISO timestamps compare lexicographically, so `<`/`>` is safe. */
function byDateDesc(a: Review, b: Review): number {
  if (a.date < b.date) return 1;
  if (a.date > b.date) return -1;
  return 0;
}

/**
 * Shuffles the merged review list into a semi-random display order.
 *
 * The page is prerendered and Cache Components is on, so a bare
 * `Math.random()` here would fail the build (synchronous IO can't be deferred
 * — see `migrating-to-cache-components.md`). `"use cache"` captures the
 * shuffled order into the static shell instead, computed once and reused —
 * the `max` cache-life profile (30-day revalidate) means every visitor sees
 * the same order without needing a `<Suspense>` + `connection()` opt-out of
 * prerendering for true per-request randomness.
 */
async function shuffleReviews(reviews: Review[]): Promise<Review[]> {
  "use cache";
  cacheLife("max");

  const shuffled = [...reviews];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** How many photo cards the "verified guests" row shows at most. */
const MAX_FEATURED = 4;

/**
 * The reviews shown as photo cards under the marquee: hand-picked
 * (`featured`) manual reviews first, then any live Google review that came
 * with a guest photo, newest first. Only reviews that actually have a photo
 * qualify — the row exists to show the day (and the vehicles) as guests saw it.
 */
function pickFeatured(reviews: Review[]): Review[] {
  const withPhoto = reviews.filter((r) => (r.photos?.length ?? 0) > 0);
  const pinned = withPhoto.filter((r) => r.featured);
  const rest = withPhoto.filter((r) => !r.featured).sort(byDateDesc);
  return [...pinned, ...rest].slice(0, MAX_FEATURED);
}

/**
 * Homepage reviews section (Server Component).
 *
 * Fetches live Google Reviews server-side (`"use cache"`, 6h revalidation via
 * the `reviews` cache-life profile in next.config.ts), merges them with the
 * hand-curated reviews in `lib/reviews/manual-reviews.ts`, and renders:
 *   - three static headline cards (TripAdvisor, GetYourGuide, live Google)
 *     plus a compact "also rated on" cluster;
 *   - one auto-scrolling row of the merged reviews, shuffled
 *     (`shuffleReviews`);
 *   - a row of verified guest reviews with their photos shown directly.
 *
 * All the interactivity (auto-scroll, read-more, the inspector) is pushed
 * into the client `ReviewsMarquee` / `ReviewCard`.
 *
 * Failure modes (never a broken section):
 *   - Google unconfigured or failing → `getGoogleReviews()` returns `null` →
 *     the Google stat card is omitted and only manual reviews feed the row.
 *   - No Google and no manual reviews → the stats row renders, the row is
 *     hidden. The section always renders the heading + static badges.
 */
export async function ReviewsSection() {
  const google = await getGoogleReviews();

  // Manual reviews are ALWAYS included — even when live Google reviews exist —
  // so hand-curated testimonials never disappear behind the live data.
  const sortedReviews = [...manualReviews, ...(google?.reviews ?? [])].sort(
    byDateDesc,
  );
  // Shuffled (not date order) so the marquee doesn't read as sorted; see
  // `shuffleReviews` for why this needs `"use cache"` instead of a bare
  // `.sort(() => Math.random() - 0.5)`.
  const allReviews = await shuffleReviews(sortedReviews);
  const featured = pickFeatured(sortedReviews);

  // Headline order (client request): TripAdvisor, GetYourGuide, then Google.
  // `headlineStats` is TripAdvisor-first already; the live Google card goes
  // last so a failed fetch drops the tail, not the middle.
  return (
    <section id="reviews" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            What Our Guests Say
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Real reviews from travelers who&apos;ve explored Veneto with us.
          </p>
        </div>

        {/* Aggregate stats */}
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap">
            {headlineStats.map((stat) => (
              <ReviewStatsBadge
                key={stat.platform}
                name={stat.name}
                ota={stat.platform}
                rating={stat.rating}
                count={stat.count}
              />
            ))}
            {google !== null && (
              <ReviewStatsBadge
                name="Google"
                ota="google"
                rating={google.rating}
                count={google.totalCount}
              />
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Also rated on
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {alsoRatedOnStats.map((stat) => (
                <ReviewStatsBadge
                  key={stat.platform}
                  compact
                  name={stat.name}
                  href={stat.href}
                  ota={stat.platform}
                  rating={stat.rating}
                  count={stat.count}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Auto-scrolling row + verified photo reviews */}
        {allReviews.length > 0 && (
          <div className="mt-12">
            <ReviewsMarquee reviews={allReviews} featured={featured} />
          </div>
        )}
      </div>
    </section>
  );
}
