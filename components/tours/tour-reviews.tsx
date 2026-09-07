import { format } from "date-fns";

import { RatingStars } from "@/components/tours/rating-stars";
import type { TourRating, TourReview } from "@/lib/regiondo/types";

interface TourReviewsProps {
  reviews: readonly TourReview[];
  rating: TourRating | null;
}

/**
 * Genuine Regiondo reviews for this tour.
 *
 * Renders nothing at all when there are none, rather than a "no reviews yet"
 * placeholder — an empty section on a product page reads as a warning. Eight of
 * the eleven live tours have no reviews, so this is the common case.
 */
export function TourReviews({ reviews, rating }: TourReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="reviews-heading" className="text-2xl font-bold">
          What guests say
        </h2>
        {rating ? <RatingStars rating={rating} size="md" /> : null}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {reviews.slice(0, 4).map((review) => (
          <li key={review.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {review.title ? (
                  <h3 className="truncate font-semibold">{review.title}</h3>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {review.author}
                  {review.createdAt ? ` · ${formatReviewDate(review.createdAt)}` : ""}
                </p>
              </div>
              {review.rating !== null ? (
                <RatingStars
                  rating={{ value: review.rating, count: 1 }}
                  hideCount
                  className="shrink-0"
                />
              ) : null}
            </div>

            <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-muted-foreground">
              {review.body}
            </p>

            {review.response ? (
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
                {review.response}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Regiondo returns "2026-08-29 08:04:10", which `new Date()` parses as local
 * time in Node and — historically — inconsistently in browsers. Normalising to
 * an explicit UTC instant keeps the server and client HTML identical.
 */
function formatReviewDate(raw: string): string {
  const parsed = new Date(`${raw.replace(" ", "T")}Z`);
  return Number.isNaN(parsed.getTime()) ? "" : format(parsed, "MMMM yyyy");
}
