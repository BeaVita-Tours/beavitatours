import Link from "next/link";

import { PriceDisplay } from "@/components/tours/price-display";
import { Skeleton } from "@/components/ui/skeleton";
import type { TourPrice } from "@/lib/regiondo/types";

/**
 * The booking box's non-interactive states, shared by the server-rendered
 * page and the client-side fallback so both say the same thing.
 */

export function UnbookableNotice() {
  return <p className="text-sm text-muted-foreground">This tour is not bookable online.</p>;
}

export function NoDatesNotice({ priceFrom }: { priceFrom: TourPrice }) {
  return (
    <div className="space-y-3">
      <PriceDisplay price={priceFrom} showFrom size="lg" unit="per person" />
      <p className="text-sm text-muted-foreground">
        No dates are open for online booking at the moment.
      </p>
      <Link
        href="/contact"
        className="inline-flex text-sm font-medium text-primary-strong underline-offset-4 hover:underline"
      >
        Ask us about a private departure
      </Link>
    </div>
  );
}

/**
 * Shown while live availability or the booking widget is loading. Carries the
 * real starting price, so the most important number is there from the start.
 */
export function BookingSkeleton({
  priceFrom,
  label = "Checking live availability…",
}: {
  priceFrom: TourPrice;
  label?: string;
}) {
  return (
    <div className="space-y-5">
      <PriceDisplay price={priceFrom} showFrom size="lg" unit="per person" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-11 w-full" />
      <p className="text-center text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
