"use client";

import { Camera } from "lucide-react";

import { reviewPlatformName } from "@/lib/reviews/platform-stats";
import type { Review } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
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
  // The operator's reply only shows in the inspector, so it counts as "more".
  const isLong =
    review.text.length > READ_MORE_THRESHOLD || Boolean(review.ownerResponse);
  const photoCount = review.photos?.length ?? 0;
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

      {/* Stars + photo count. The chip is the whole point for a review with
          photos: it tells the visitor there is something to open, and the
          inspector then shows the pictures in full. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ReviewRating rating={review.rating} />
        {photoCount > 0 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenReview?.(review);
            }}
            aria-haspopup="dialog"
            aria-label={`Open review with ${photoCount} ${photoCount === 1 ? "photo" : "photos"}`}
            className="inline-flex touch-manipulation items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted"
          >
            <Camera className="size-3" aria-hidden="true" />+{photoCount}{" "}
            {photoCount === 1 ? "photo" : "photos"}
          </button>
        )}
      </div>

      {/* Title (Regiondo reviews carry one) + text, always clamped so the card
          stays its normal size in the row. */}
      {review.title && (
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {review.title}
        </p>
      )}
      {hasText && (
        <p
          className={cn(
            "text-sm leading-relaxed text-foreground/80",
            review.title ? "line-clamp-3" : "line-clamp-4",
          )}
        >
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
