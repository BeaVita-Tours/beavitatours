import { TourGrid } from "@/components/tours/tour-grid";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { THEME_UPSELLS, type ThemeKey, type ThemeUpsell } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";
import type { TourSummary } from "@/lib/regiondo/types";

/**
 * Bookable departures on a theme page.
 *
 * The hand-written pages under `/tours/*` describe a subject — the Dolomites,
 * the Prosecco hills — and this is where the reader gets to act on it: every
 * departure that delivers the subject, between the copy and the closing
 * choice. The whole curated set is shown; the sets are one to seven tours,
 * which is a page section, not a catalog.
 *
 * One self-contained section — eyebrow, heading, intro and the grid — the
 * same on every theme page, so the reader meets the departures the same way
 * wherever they are. (It used to come in a headless variant for Food & Wine;
 * the client asked for the introduction there too.)
 *
 * A Server Component with no client JavaScript: the cards are static and the
 * links are links. Dropping one into a page costs nothing but the HTML.
 *
 * Renders nothing when `REGIONDO_NATIVE_BOOKING` is off.
 */

async function loadThemeTours(
  theme: ThemeKey
): Promise<{ tours: readonly TourSummary[]; degraded: boolean }> {
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
  return { tours: ordered, degraded };
}

/** The self-contained section: heading, intro and the grid. */
export async function ThemeUpsell({ theme }: { theme: ThemeKey }) {
  if (!isNativeBookingEnabled()) return null;

  const config: ThemeUpsell = THEME_UPSELLS[theme];
  const { tours, degraded } = await loadThemeTours(theme);

  if (tours.length === 0) return null;

  return (
    <section aria-labelledby={`upsell-${theme}`} className="border-t border-border bg-muted/30 py-16">
      <script {...jsonLdScriptProps(itemListJsonLd(tours, config.heading))} />

      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
            Book a day trip
          </p>
          <h2 id={`upsell-${theme}`} className="text-3xl font-bold tracking-tight md:text-4xl">
            {config.heading}
          </h2>
          <p className="text-lg text-muted-foreground">{config.intro}</p>
        </div>

        {/* The visible h2 above already names this section, so the grid
            reuses it rather than adding a hidden duplicate. */}
        <TourGrid
          tours={tours}
          degraded={degraded}
          priorityCount={0}
          headingId={`upsell-${theme}`}
        />
      </div>
    </section>
  );
}
