"use client";

import { BadgeCheck, Images } from "lucide-react";

import type { Review } from "@/lib/reviews/types";
import { ReviewAuthorHeader, ReviewPhoto, ReviewRating } from "./review-parts";

/**
 * The "verified guests" row: reviews that came with a photo, shown as photo
 * cards — the picture on top, the review beneath — so the day itself (the
 * minivan, the lakes, the table at the winery) is visible without opening
 * anything. Clicking a card opens the shared inspector, exactly like the
 * marquee cards.
 *
 * "Verified" here means the review was left on a booking platform or on
 * Google, and the photo was attached by the same guest — nothing on this row
 * is a stock image. The footer's "report" link is the takedown route for
 * anyone who recognises themselves.
 */
export function FeaturedReviews({
  reviews,
  onOpenReview,
}: {
  reviews: Review[];
  onOpenReview: (review: Review) => void;
}) {
  if (reviews.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-1 text-center">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-strong">
          <BadgeCheck className="size-4" aria-hidden="true" />
          Verified guests, in their own photos
        </p>
        <p className="text-sm text-muted-foreground">
          Pictures shared by travelers alongside their reviews.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((review) => {
          const photo = review.photos?.[0];
          const extra = (review.photos?.length ?? 1) - 1;
          if (!photo) return null;

          return (
            <li key={review.id} className="min-w-0">
              <article
                onClick={() => onOpenReview(review)}
                className="group flex h-full cursor-pointer touch-manipulation flex-col overflow-hidden rounded-2xl border bg-card text-left transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  <ReviewPhoto
                    photo={photo}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  {extra > 0 && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      <Images className="size-3" aria-hidden="true" />+{extra}{" "}
                      {extra === 1 ? "photo" : "photos"}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <ReviewAuthorHeader review={review} />
                  <ReviewRating rating={review.rating} />
                  {review.text.trim().length > 0 && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
                      {review.text}
                    </p>
                  )}
                  <span className="mt-auto pt-1 text-sm font-medium text-primary">
                    Read the review
                  </span>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
