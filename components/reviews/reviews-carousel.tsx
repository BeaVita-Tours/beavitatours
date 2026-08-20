"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./review-card";
import type { Review } from "@/lib/reviews/types";

/**
 * Horizontally scrollable reviews row.
 *
 * Wraps the site's Embla-based shadcn `Carousel`: touch/mouse drag comes from
 * Embla, and the region is keyboard-focusable (`tabIndex={0}` + arrow keys,
 * handled by the wrapper). Arrow buttons are custom (not the default
 * CarouselPrevious/Next) so they sit top-right without overflowing the
 * container. Fixed `basis-[300px]` slides + `align: "start"` show a partial
 * next card as a browsing affordance.
 */
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {reviews.length} recent {reviews.length === 1 ? "review" : "reviews"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => api?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous reviews"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => api?.scrollNext()}
            disabled={!canNext}
            aria-label="Next reviews"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <Carousel
        opts={{ align: "start", containScroll: "trimSnaps" }}
        setApi={setApi}
        tabIndex={0}
        aria-label="Traveler reviews"
        className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <CarouselContent>
          {reviews.map((review) => (
            <CarouselItem key={review.id} className="basis-[300px] sm:basis-[340px]">
              <ReviewCard review={review} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
