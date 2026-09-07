"use client";

import { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Marquee } from "@/components/ui/marquee";
import type { Review } from "@/lib/reviews/types";
import { FeaturedReviews } from "./featured-reviews";
import { ReviewCard } from "./review-card";
import { ReviewInspector } from "./review-inspector";

/** Fixed card width so the marquee row stays visually even at any viewport. */
const CARD_WIDTH = "w-72 sm:w-80";

function ReviewRow({
  reviews,
  paused,
  touchScroll,
  onOpenReview,
}: {
  reviews: Review[];
  paused: boolean;
  touchScroll: boolean;
  onOpenReview: (review: Review) => void;
}) {
  return (
    <Marquee repeat={4} paused={paused} touchScroll={touchScroll}>
      {reviews.map((review) => (
        <div key={review.id} className={CARD_WIDTH}>
          <ReviewCard review={review} onOpenReview={onOpenReview} />
        </div>
      ))}
    </Marquee>
  );
}

/**
 * The reviews strip: one auto-scrolling row of every review, and beneath it
 * the "verified guests" row — a static grid of reviews shown with their photo
 * (`FeaturedReviews`).
 *
 * It used to be two rows scrolling in opposite directions; the client asked
 * for a single row plus the photo row, so the photos of the actual days (and
 * the vehicles) are visible without opening anything.
 *
 * Hovering anywhere over the strip pauses the row so the cards' interactive
 * controls — the "Read more" button and any deep links in `ReviewCard` — stay
 * clickable.
 *
 * The strip also owns the review inspector, shared by the marquee cards and
 * the featured cards: clicking any card (or "Read more") opens it in a Dialog
 * (desktop) / Drawer (mobile), and the row pauses for its whole lifetime via
 * the Marquee's `paused` prop.
 */
export function ReviewsMarquee({
  reviews,
  featured = [],
}: {
  reviews: Review[];
  /** Reviews with a photo, shown as photo cards under the row. */
  featured?: Review[];
}) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Coarse pointer (touch) devices let the row be finger-scrolled. Desktop
  // mouse/trackpad users keep auto-scroll + hover-to-pause instead.
  const isTouch = useMediaQuery("(hover: none) and (pointer: coarse)");

  const stripRef = useRef<HTMLDivElement>(null);
  // Last known pointer position, tracked passively so the inspector's
  // `onOpenChange` can tell — without a real mouseleave/mouseenter firing —
  // whether the pointer is still over the strip when the dialog closes.
  const lastPointerPos = useRef({ x: -1, y: -1 });

  useEffect(() => {
    if (isTouch) return;
    const handleMove = (event: MouseEvent) => {
      lastPointerPos.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isTouch]);

  if (reviews.length === 0) return null;

  const paused = selectedReview !== null || isHovering;

  return (
    <div className="space-y-12">
      <div
        ref={stripRef}
        // On touch, `:hover`/`pointerenter` can linger after a tap; touchScroll
        // already pauses on interaction instead, so skip hover-pause there.
        onMouseEnter={isTouch ? undefined : () => setIsHovering(true)}
        onMouseLeave={isTouch ? undefined : () => setIsHovering(false)}
      >
        <ReviewRow
          reviews={reviews}
          paused={paused}
          touchScroll={isTouch}
          onOpenReview={setSelectedReview}
        />
      </div>

      {featured.length > 0 && (
        <FeaturedReviews reviews={featured} onOpenReview={setSelectedReview} />
      )}

      <ReviewInspector
        review={selectedReview}
        isDesktop={isDesktop}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReview(null);
            // The dialog/drawer overlay sits over the strip, so the browser
            // doesn't fire a real mouseleave/mouseenter when it closes
            // without the pointer moving — `isHovering` would otherwise be
            // left stale from before the inspector opened. Instead, check
            // the last tracked pointer position against the strip's bounds:
            // still over a card → stay paused, like the pointer never left;
            // elsewhere → resume, like a normal mouseleave would.
            const rect = stripRef.current?.getBoundingClientRect();
            const { x, y } = lastPointerPos.current;
            setIsHovering(
              !isTouch &&
                !!rect &&
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom,
            );
          }
        }}
      />
    </div>
  );
}
