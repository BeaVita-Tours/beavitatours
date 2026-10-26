import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TourRating } from "@/lib/regiondo/types";

interface RatingStarsProps {
  rating: TourRating;
  size?: "sm" | "md";
  /** Hide the "(7)" count, for tight card layouts. */
  hideCount?: boolean;
  className?: string;
}

/**
 * Fractional star rating.
 *
 * Same technique as `components/reviews/review-stats-badge.tsx` — a filled row
 * clipped to a percentage over an outline row — kept here rather than shared
 * because that component is a client component tied to the OTA wordmarks, and
 * this one needs to render on the server inside cached catalog markup.
 *
 * Only ever rendered from genuine Regiondo review data. Tours with no reviews
 * get no stars and no `AggregateRating` markup.
 */
export function RatingStars({ rating, size = "sm", hideCount, className }: RatingStarsProps) {
  const percent = Math.max(0, Math.min(100, (rating.value / 5) * 100));
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="relative inline-flex"
        role="img"
        aria-label={`Rated ${rating.value} out of 5 from ${rating.count} ${
          rating.count === 1 ? "review" : "reviews"
        }`}
      >
        <span className="inline-flex" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} className={cn(starSize, "text-border")} />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex overflow-hidden"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} className={cn(starSize, "shrink-0 fill-amber-400 text-amber-400")} />
          ))}
        </span>
      </span>

      <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">
        {rating.value.toFixed(1)}
        {hideCount ? null : ` (${rating.count})`}
      </span>
    </span>
  );
}
