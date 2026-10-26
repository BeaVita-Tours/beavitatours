"use client";

import { useState } from "react";

import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewInspector } from "@/components/reviews/review-inspector";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Review } from "@/lib/reviews/types";

/**
 * The homepage review cards, laid out as a static grid rather than the
 * marquee: a tour has a handful of reviews at most and a booker wants to read
 * them, not watch them go by. Clicking a card (or "Read more") opens the same
 * inspector the homepage uses — Dialog on desktop, Drawer on mobile.
 */
export function TourReviewGrid({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} onOpenReview={setSelectedReview} />
          </li>
        ))}
      </ul>

      <ReviewInspector
        review={selectedReview}
        isDesktop={isDesktop}
        onOpenChange={(open) => {
          if (!open) setSelectedReview(null);
        }}
      />
    </>
  );
}
