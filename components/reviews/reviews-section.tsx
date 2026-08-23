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

/**
 * Homepage reviews section (Server Component).
 *
 * Fetches live Google Reviews server-side (`"use cache"`, 6h revalidation via
 * the `reviews` cache-life profile in next.config.ts), merges them with the
 * hand-curated reviews in `lib/reviews/manual-reviews.ts`, and renders:
 *   - an aggregate stats row (live Google + static TripAdvisor/GetYourGuide)
 *     plus a compact "also rated on" cluster;
 *   - a scrollable row of the merged reviews, shuffled (`shuffleReviews`).
 *
 * All the interactivity (auto-scroll, read-more) is pushed into the client
 * `ReviewsMarquee` / `ReviewCard`.
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
  // Shuffled (not date order) so the two-row marquee doesn't read as sorted;
  // see `shuffleReviews` for why this needs `"use cache"` instead of a bare
  // `.sort(() => Math.random() - 0.5)`.
  const allReviews = await shuffleReviews(sortedReviews);

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
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-stretch justify-center gap-3">
            {google !== null && google.url && (
              <ReviewStatsBadge
                name="Google"
                ota="google"
                href={google.url}
                rating={google.rating}
                count={google.totalCount}
              />
            )}
            {headlineStats.map((stat) => (
              <ReviewStatsBadge
                key={stat.platform}
                name={stat.name}
                href={stat.href}
                ota={stat.platform}
                rating={stat.rating}
                count={stat.count}
              />
            ))}
          </div>

          <div className="mt-5">
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

        {/* Auto-scrolling reviews rows */}
        {allReviews.length > 0 && (
          <div className="mt-12">
            <ReviewsMarquee reviews={allReviews} />
          </div>
        )}
      </div>
    </section>
  );
}
