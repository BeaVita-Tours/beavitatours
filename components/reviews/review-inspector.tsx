"use client";

import { Camera, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { reviewPlatformName } from "@/lib/reviews/platform-stats";
import type { Review } from "@/lib/reviews/types";
import { ReviewAuthorHeader, ReviewPhoto, ReviewRating } from "./review-parts";
import { OTAWordmark } from "../ota-wordmark";
import { reviewPlatformLogo } from "@/lib/reviews/platform-stats";

/**
 * Focused reading view for a single review. Opened by clicking any ReviewCard
 * (or its "Read more" button). Centered `Dialog` on desktop, `Drawer` bottom
 * sheet on mobile — both render the same content so it feels like the card was
 * expanded rather than navigating to a separate page. Renders nothing while
 * `review` is null.
 */
export function ReviewInspector({
  review,
  onOpenChange,
  isDesktop,
}: {
  review: Review | null;
  onOpenChange: (open: boolean) => void;
  isDesktop: boolean;
}) {
  if (!review) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl gap-0 bg-card p-5 sm:p-6">
          <DialogTitle className="sr-only">
            Review by {review.authorName}
          </DialogTitle>
          <DialogDescription className="sr-only">Full review text.</DialogDescription>
          <InspectorContent review={review} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open onOpenChange={handleOpenChange} direction="bottom">
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[85dvh] bg-card border-t p-5 sm:p-6">
        <DrawerTitle className="sr-only">
          Review by {review.authorName}
        </DrawerTitle>
        <DrawerDescription className="sr-only">Full review text.</DrawerDescription>
        <div className="mb-3 flex shrink-0 justify-end">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </div>
        <div className="min-h-0 overflow-y-auto">
          <InspectorContent review={review} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** The visible body of the inspector — the "expanded card" reading view. */
function InspectorContent({ review }: { review: Review }) {
  const platform = reviewPlatformName(review.source, review.platformLabel);
  const hasText = review.text.trim().length > 0;
  const photos = review.photos ?? [];
  // Google deep links send visitors off to Maps; keep the source link only for
  // hand-added reviews, mirroring the ReviewCard behaviour.
  const hasExternalLink =
    Boolean(review.sourceUrl) && review.source !== "google";
  const reviewLogo = reviewPlatformLogo(review.source, review.platformLabel);

  return (
    <div className="flex flex-col gap-4">
      {/* Author + date, enlarged to card proportions. The platform badge is
          hidden here (source lives in the footer) so the top-right corner stays
          clear of the dialog's close button. */}
      <ReviewAuthorHeader
        review={review}
        showPlatform={false}
        avatarClassName="size-12"
        nameClassName="text-base font-semibold text-foreground"
        dateClassName="text-sm text-muted-foreground"
      />

      {/* Stars + photo count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ReviewRating rating={review.rating} starClassName="size-5" />
        {photos.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="size-3.5" aria-hidden="true" />+{photos.length}{" "}
            {photos.length === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>

      {/* Guest photos — the first one large, any others as a strip beneath.
          Shown above the text: the photo is what the "+N photo" chip promised. */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted">
            <ReviewPhoto
              photo={photos[0]!}
              sizes="(min-width: 640px) 560px, 100vw"
              className="size-full object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(1).map((photo) => (
                <div
                  key={photo.url}
                  className="relative aspect-4/3 overflow-hidden rounded-lg bg-muted"
                >
                  <ReviewPhoto
                    photo={photo}
                    sizes="180px"
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full text — unclamped, whitespace preserved */}
      {hasText && (
        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 md:text-base">
          {review.text}
        </p>
      )}

      {/* Source + link */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <span className="text-xs text-muted-foreground flex flex-row gap-1 items-center justify-center">
          from{" "}
          {reviewLogo ? (
            <OTAWordmark ota={reviewLogo} height={16} />
          ) : (
            <span>{platform}</span>
          )}
        </span>
        {hasExternalLink && (
          <a
            href={review.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
          >
            Read on {platform}
          </a>
        )}
      </div>
    </div>
  );
}
