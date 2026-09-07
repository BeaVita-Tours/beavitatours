import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TourGrid } from "@/components/tours/tour-grid";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { THEME_UPSELLS, type ThemeKey, type ThemeUpsell } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

/**
 * Bookable departures on a theme page.
 *
 * The five hand-written pages under `/tours/*` describe a subject — the
 * Dolomites, the Prosecco hills — and this is where the reader gets to act on
 * it: every departure that delivers the subject, between the copy and the
 * closing CTA. The whole curated set is shown; the sets are two to seven tours,
 * which is a page section, not a catalog.
 *
 * A Server Component with no client JavaScript: the cards are static and the
 * links are links. Dropping it into a page costs nothing but the HTML.
 *
 * Renders nothing when `REGIONDO_NATIVE_BOOKING` is off, so these pages look
 * exactly as they do today until the flag is turned on.
 */
export async function ThemeUpsell({ theme }: { theme: ThemeKey }) {
  if (!isNativeBookingEnabled()) return null;

  const config: ThemeUpsell = THEME_UPSELLS[theme];
  const { tours, degraded } = await listTours({
    productIds: config.productIds,
    limit: 250,
  });

  // Regiondo returns its own ordering; the curated order is the editorial one
  // (shared and lower-priced first), so it is reapplied here.
  const rank = new Map(config.productIds.map((id, index) => [id, index]));
  const ordered = [...tours].sort(
    (a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );

  // A Regiondo outage on an editorial page should leave the page as it was,
  // not add an error box to it. The closing CTA still gets the reader to us.
  if (ordered.length === 0) return null;

  return (
    <section aria-labelledby={`upsell-${theme}`} className="border-t border-border bg-muted/30 py-16">
      <script {...jsonLdScriptProps(itemListJsonLd(ordered, config.heading))} />

      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
              Book a day trip
            </p>
            <h2 id={`upsell-${theme}`} className="text-3xl font-bold tracking-tight md:text-4xl">
              {config.heading}
            </h2>
            <p className="text-lg text-muted-foreground">{config.intro}</p>
          </div>

          <Link
            href="/tours"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            See every day trip we run
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* The visible h2 above already names this section, so the grid
            reuses it rather than adding a hidden duplicate. */}
        <TourGrid
          tours={ordered}
          degraded={degraded}
          priorityCount={0}
          headingId={`upsell-${theme}`}
        />
      </div>
    </section>
  );
}
