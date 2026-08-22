import Link from "next/link";
import { Star } from "lucide-react";

import { OTAWordmark } from "@/components/ota-wordmark";
import type { PlatformId } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

type ReviewStatsBadgeProps = {
  /** Outbound URL. Google links to the Maps place page; others to their
   * stored platform homepage (linked as-is). */
  href?: string;
  name: string;
  ota: PlatformId;
  rating: number | string;
  /** Review count shown when known (live for Google, hardcoded otherwise). */
  count?: number;
  /** Smallest variant, used in the "also rated on" cluster. */
  compact?: boolean;
};

/**
 * Five stars with true fractional fill — a 4.86 rating fills 4 stars and 86%
 * of the fifth, the rest staying outlined. The number sits beside the stars.
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          // Rounded to whole percent so 4.9 renders exactly 90%, not 90.0000000003%.
          const fraction = Math.max(0, Math.min(1, rating - (i - 1)));
          const percent = Math.round(fraction * 100);
          return (
            <span key={i} className="relative inline-flex">
              <Star className="size-4 text-border" />
              {percent > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${percent}%` }}
                >
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </span>
              )}
            </span>
          );
        })}
      </span>
      <span className="text-sm text-foreground tabular-nums">
        {+rating.toFixed(2)}
      </span>
    </div>
  );
}

export function ReviewStatsBadge({
  href,
  name,
  ota,
  rating,
  count,
  compact = false,
}: ReviewStatsBadgeProps) {
  if (compact) {
    return (
      <Link
        href={href ? href : "#"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} reviews`}
        // Wordmark vertically centered against the rating line.
        className={cn(
          "inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors",
          href ? "hover:bg-muted/30" : "cursor-default",
        )}
      >
        <OTAWordmark ota={ota} height={14} className="pr-1" />
        <div className="inline-flex items-center gap-1">
          <span className="font-semibold tabular-nums text-foreground">
            {rating}
          </span>
          {typeof rating === "number" && (
            <Star className="size-4 fill-amber-400 text-amber-400 pb-[0.25]" />
          )}
        </div>

        {count && (
          <span className="text-muted-foreground/70">
            ({count.toLocaleString("en-US")})
          </span>
        )}
      </Link>
    );
  }

  // The rating is conveyed visually by the stars + number; keep the exact
  // value in the accessible name so screen readers aren't left guessing.
  const a11yLabel =
    typeof rating === "number"
      ? `${name} · ${rating} out of 5${count ? ` · ${count} reviews` : ""}`
      : `${name} · ${rating}`;

  return (
    <Link
      href={href ? href : "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={a11yLabel}
      // w-56 is wide enough for the largest wordmark (GetYourGuide, 11.3:1) at
      // its 20px height, so every platform's mark can render at the same size.
      className="flex w-56 flex-col items-center justify-center rounded-2xl border bg-card px-4 py-5 text-center transition-colors hover:bg-muted/30"
    >
      {/* Platform wordmark — stands apart from the rating block below. The
          height is shared across all platforms so the marks render uniformly
          (a wide logo is wider, never taller). */}
      <OTAWordmark ota={ota} height={20} />

      {typeof rating === "number" ? (
        // Rating block: stars + number + count grouped tightly, clearly
        // separated from the logo by the larger gap above.
        <span className="mt-4 flex flex-col items-center gap-2">
          <StarRating rating={rating} />
          {count && (
            <span className="text-xs text-muted-foreground">
              {count.toLocaleString("en-US")}
              {"+ "}
              {count === 1 ? "review" : "reviews"}
            </span>
          )}
        </span>
      ) : (
        <span className="mt-4 text-base font-semibold text-foreground">
          {rating}
        </span>
      )}
    </Link>
  );
}
