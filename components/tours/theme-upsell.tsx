import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TourGrid } from "@/components/tours/tour-grid";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { THEME_UPSELLS, type ThemeKey, type ThemeUpsell } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

/** How many cards to show before the "see everything" link takes over. */
const VISIBLE = 3;

/**
 * Bookable departures on a theme page.
 *
 * The five hand-written pages under `/tours/*` describe a subject — the
 * Dolomites, the Prosecco hills — and then hand the reader to `/rates`, which
 * is a price list rather than something you can book. This drops the actual
 * departures for that subject into the page, between the copy and the existing
 * CTA, so the reader can act while they are still interested.
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
  // not add an error box to it. The existing CTA still gets the reader to us.
  if (ordered.length === 0) return null;

  const shown = ordered.slice(0, VISIBLE);
  const remaining = ordered.length - shown.length;

  return (
    <section aria-labelledby={`upsell-${theme}`} className="border-t border-border py-16">
      {/* Only the tours actually rendered are listed, so the markup matches
          what a reader sees. */}
      <script {...jsonLdScriptProps(itemListJsonLd(shown, config.heading))} />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id={`upsell-${theme}`} className="text-3xl font-bold md:text-4xl">
            {config.heading}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">{config.intro}</p>
        </div>

        <div className="mt-10">
          {/* The visible h2 above already names this region, so the grid
              reuses it rather than adding a hidden duplicate. */}
          <TourGrid
            tours={shown}
            degraded={degraded}
            priorityCount={0}
            headingId={`upsell-${theme}`}
          />
        </div>

        <p className="mt-8 text-center">
          <Link
            href={config.browseHref}
            className="inline-flex items-center gap-1.5 font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {remaining > 0
              ? `${config.browseLabel} (${remaining} more)`
              : config.browseLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </p>
      </div>
    </section>
  );
}
