"use client";

import { Marquee } from "@/components/ui/marquee";
import { ReviewCard } from "./review-card";
import type { Review } from "@/lib/reviews/types";

/** Fixed card width so the marquee rows stay visually even at any viewport. */
const CARD_WIDTH = "w-72 sm:w-80";

function ReviewRow({
  reviews,
  reverse,
}: {
  reviews: Review[];
  reverse?: boolean;
}) {
  return (
    <Marquee reverse={reverse} pauseOnHover repeat={4}>
      {reviews.map((review) => (
        <div key={review.id} className={CARD_WIDTH}>
          <ReviewCard review={review} />
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
 * "Read more" toggle and any deep links in `ReviewCard` — stay clickable.
 *
 * Rows are independent horizontal marquees, so the layout degrades gracefully
 * on mobile (cards are a fixed ~288px and just scroll off-screen).
 */
export function ReviewsMarquee({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  // Newest half first, older half second — so both rows feel balanced.
  const midpoint = Math.ceil(reviews.length / 2);
  const top = reviews.slice(0, midpoint);
  const bottom = reviews.slice(midpoint);

  return (
    <div className="space-y-4">
      {top.length > 0 && <ReviewRow reviews={top} />}
      {bottom.length > 0 && <ReviewRow reviews={bottom} reverse />}
    </div>
  );
}
