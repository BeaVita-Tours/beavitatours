"use client";

import { reviewPlatformName } from "@/lib/reviews/platform-stats";
import type { Review } from "@/lib/reviews/types";
import { ReviewAuthorHeader, ReviewRating } from "./review-parts";

/** Texts longer than this (roughly 2–3 lines) offer a "Read more" affordance. */
const READ_MORE_THRESHOLD = 160;

export function ReviewCard({
  review,
  onOpenReview,
}: {
  review: Review;
  onOpenReview?: (review: Review) => void;
}) {
  const platform = reviewPlatformName(review.source, review.platformLabel);
  const hasText = review.text.trim().length > 0;
  const isLong = review.text.length > READ_MORE_THRESHOLD;
  // Google review deep links send visitors off to Maps; the client prefers
  // guests to stay on page, so drop the link for Google but keep it for
  // hand-added reviews (e.g. a Facebook testimonial).
  const hasExternalLink =
    Boolean(review.sourceUrl) && review.source !== "google";

  return (
    <article
      onClick={() => onOpenReview?.(review)}
      className="flex h-full cursor-pointer touch-manipulation flex-col gap-3 rounded-2xl border bg-card p-5 text-left min-h-64"
    >
      {/* Author + platform */}
      <ReviewAuthorHeader review={review} />

      {/* Stars */}
      <ReviewRating rating={review.rating} />

      {/* Text (always clamped so the card stays its normal size in the row) */}
      {hasText && (
        <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80">
          {review.text}
        </p>
      )}

      {/* Actions */}
      {(isLong || hasExternalLink) && (
        <div className="mt-auto flex items-center gap-4 pt-1">
          {isLong && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenReview?.(review);
              }}
              aria-haspopup="dialog"
              className="touch-manipulation text-sm font-medium text-primary hover:underline"
            >
              Read more
            </button>
          )}
          {hasExternalLink && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="touch-manipulation text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
            >
              Read on {platform}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
