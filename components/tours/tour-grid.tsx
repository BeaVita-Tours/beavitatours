import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TourCard, TourCardSkeleton } from "@/components/tours/tour-card";
import type { TourSummary } from "@/lib/regiondo/types";

interface TourGridProps {
  tours: readonly TourSummary[];
  /**
   * True when Regiondo could not be reached. The grid says so plainly instead
   * of pretending the catalog is empty — "no tours match" and "we cannot reach
   * our booking system" are very different messages to a visitor.
   */
  degraded?: boolean;
  /** Number of leading cards to mark `priority`, for the LCP image. */
  priorityCount?: number;
  emptyTitle?: string;
  emptyBody?: string;
}

export function TourGrid({
  tours,
  degraded = false,
  priorityCount = 1,
  emptyTitle = "No tours match those filters",
  emptyBody = "Try widening the date range or clearing a filter.",
}: TourGridProps) {
  if (tours.length === 0) {
    return degraded ? (
      <div
        role="status"
        className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <p className="text-lg font-semibold text-foreground">
          We cannot reach our booking system right now
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          This is usually brief. Please try again in a moment — or get in touch and we will put
          the booking together for you.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyBody}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/tours">See all tours</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, index) => (
        <TourCard key={tour.id} tour={tour} priority={index < priorityCount} />
      ))}
    </div>
  );
}

export function TourGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
        <TourCardSkeleton key={index} />
      ))}
    </div>
  );
}
