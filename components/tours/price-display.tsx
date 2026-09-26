import { cn } from "@/lib/utils";
import type { TourPrice } from "@/lib/regiondo/types";

/**
 * Format a price the way a European travel site does: no decimals on a round
 * number, because "€159" reads as a price and "€159.00" reads as an invoice.
 *
 * `Intl.NumberFormat` is given `en-GB` explicitly rather than the visitor's
 * locale: the site is English-only and server-rendered, and letting the number
 * format vary by client would mean the server and client HTML disagree.
 */
export function formatPrice(amount: number, currency: string): string {
  const hasCents = Math.abs(amount % 1) > 0.004;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

interface PriceDisplayProps {
  price: TourPrice;
  /** Prefix the amount with "from", for a catalog card. */
  showFrom?: boolean;
  /** Trailing unit, e.g. "per person". */
  unit?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

export function PriceDisplay({
  price,
  showFrom = false,
  unit,
  size = "md",
  className,
}: PriceDisplayProps) {
  const amount = formatPrice(price.amount, price.currency);

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5",
        className,
      )}
    >
      {showFrom ? (
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          from
        </span>
      ) : null}

      {price.wasAmount !== null ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(price.wasAmount, price.currency)}
        </span>
      ) : null}

      <span className={cn("font-bold text-foreground", SIZES[size])}>
        {amount}
      </span>

      {unit ? (
        <span className="text-sm text-muted-foreground">{unit}</span>
      ) : null}
    </p>
  );
}
