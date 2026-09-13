import { RatingStars } from "@/components/tours/rating-stars";
import { TourReviewGrid } from "@/components/tours/tour-review-grid";
import { toReviews } from "@/lib/regiondo/reviews";
import type { TourRating, TourReview } from "@/lib/regiondo/types";

interface TourReviewsProps {
  reviews: readonly TourReview[];
  rating: TourRating | null;
  className?: string;
}

/** Enough to fill two rows of the three-column grid; the API is asked for 12. */
const MAX_VISIBLE = 6;

/**
 * Genuine Regiondo reviews for this tour, in the homepage's review cards.
 *
 * Renders nothing at all when there are none, rather than a "no reviews yet"
 * placeholder — an empty section on a product page reads as a warning. Eight of
 * the eleven live tours have no reviews, so this is the common case.
 */
export function TourReviews({ reviews, rating, className }: TourReviewsProps) {
  const cards = toReviews(reviews).slice(0, MAX_VISIBLE);
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="reviews-heading" className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="reviews-heading" className="text-2xl font-bold">
          What guests say
        </h2>
        {rating ? <RatingStars rating={rating} size="md" /> : null}
      </div>

      <TourReviewGrid reviews={cards} />
    </section>
  );
}
