"use client";

import { useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Marquee } from "@/components/ui/marquee";
import type { Review } from "@/lib/reviews/types";
import { ReviewCard } from "./review-card";
import { ReviewInspector } from "./review-inspector";

/** Fixed card width so the marquee rows stay visually even at any viewport. */
const CARD_WIDTH = "w-72 sm:w-80";

function ReviewRow({
  reviews,
  reverse,
  paused,
  touchScroll,
  onOpenReview,
}: {
  reviews: Review[];
  reverse?: boolean;
  paused: boolean;
  touchScroll: boolean;
  onOpenReview: (review: Review) => void;
}) {
  return (
    <Marquee
      reverse={reverse}
      // On touch, `:hover` can linger on iOS and would keep the hover-pause
      // stuck; touchScroll already pauses on interaction instead.
      pauseOnHover={!touchScroll}
      repeat={4}
      paused={paused}
      touchScroll={touchScroll}
    >
      {reviews.map((review) => (
        <div key={review.id} className={CARD_WIDTH}>
          <ReviewCard review={review} onOpenReview={onOpenReview} />
        </div>
      ))}
    </Marquee>
  );
}

/**
 * Two-row auto-scrolling reviews strip.
 *
 * Replaces the old drag-to-scroll `ReviewsCarousel`. Splits the (date-sorted)
 * reviews into two rows that scroll in opposite directions (`reverse` on the
 * second), each via the shared `Marquee` component. `pauseOnHover` stops a row
 * while the pointer is over it so the cards' interactive controls — the
 * "Read more" button and any deep links in `ReviewCard` — stay clickable.
 *
 * The strip also owns the review inspector: clicking any card (or "Read more")
 * opens it in a Dialog (desktop) / Drawer (mobile), and the rows pause for its
 * whole lifetime via the Marquee's `paused` prop.
 */
export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Coarse pointer (touch) devices let the rows be finger-scrolled. Desktop
  // mouse/trackpad users keep auto-scroll + hover-to-pause instead.
  const isTouch = useMediaQuery("(hover: none) and (pointer: coarse)");

  if (reviews.length === 0) return null;

  // Newest half first, older half second — so both rows feel balanced.
  const midpoint = Math.ceil(reviews.length / 2);
  const top = reviews.slice(0, midpoint);
  const bottom = reviews.slice(midpoint);

  return (
    <div className="space-y-4">
      {top.length > 0 && (
        <ReviewRow
          reviews={top}
          paused={selectedReview !== null}
          touchScroll={isTouch}
          onOpenReview={setSelectedReview}
        />
      )}
      {bottom.length > 0 && (
        <ReviewRow
          reviews={bottom}
          reverse
          paused={selectedReview !== null}
          touchScroll={isTouch}
          onOpenReview={setSelectedReview}
        />
      )}

      <ReviewInspector
        review={selectedReview}
        isDesktop={isDesktop}
        onOpenChange={(open) => {
          if (!open) setSelectedReview(null);
        }}
      />
    </div>
  );
}
