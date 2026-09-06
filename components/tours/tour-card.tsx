import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriceDisplay } from "@/components/tours/price-display";
import { RatingStars } from "@/components/tours/rating-stars";
import type { TourSummary } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

interface TourCardProps {
  tour: TourSummary;
  /** Set on the first card above the fold so it becomes the LCP candidate. */
  priority?: boolean;
  className?: string;
}

/**
 * The catalog card.
 *
 * Distinct from `components/tour-card.tsx`, which is a title-over-photo tile for
 * the six hand-written theme pages. This one is a product card: it has to carry
 * price, rating and duration, so the scrim-over-image treatment would fight the
 * text. The image sits in its own plate above a white body, matching
 * `components/blog/post-card.tsx`.
 *
 * Regiondo's CDN tops out at 600×400, so `sizes` is written to ask for roughly
 * that and no more — requesting a 1200px-wide source would only upscale.
 */
export function TourCard({ tour, priority = false, className }: TourCardProps) {
  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden rounded-2xl p-0 transition-shadow duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {tour.image ? (
          <Image
            src={tour.image.url}
            alt={tour.image.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
            quality={75}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : null}

        {tour.collections.length > 0 ? (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm"
          >
            {tour.collections[0]?.replace(/ from Venice$/i, "")}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {tour.duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {tour.duration.label}
            </span>
          ) : null}
          {tour.city ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {tour.city}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold leading-snug">
          {/*
            The link wraps only the title, with an inset overlay making the whole
            card clickable. That keeps one link per card in the accessibility
            tree, so a screen reader announces the tour name rather than reading
            the price and duration as part of the link text.
          */}
          <Link href={tour.href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {tour.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">{tour.excerpt}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <PriceDisplay price={tour.priceFrom} showFrom unit="pp" />
          {tour.rating ? <RatingStars rating={tour.rating} /> : null}
        </div>
      </div>
    </Card>
  );
}

/** Matching placeholder, sized to the card so nothing shifts when it resolves. */
export function TourCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-4/3 animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-1/3 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
