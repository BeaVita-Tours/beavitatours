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
 * Two pieces:
 *   - `ThemeTourGrid` is just the cards (plus their `ItemList` markup), for a
 *     page that writes its own section around them — Food & Wine opens with a
 *     Prosecco Hills section whose copy is editorial, and the cards sit under
 *     that copy rather than under a second heading.
 *   - `ThemeUpsell` is the self-contained section: eyebrow, heading, intro
 *     and the grid.
 *
 * Server Components with no client JavaScript: the cards are static and the
 * links are links. Dropping one into a page costs nothing but the HTML.
 *
 * Both render nothing when `REGIONDO_NATIVE_BOOKING` is off.
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

interface ThemeTourGridProps {
  theme: ThemeKey;
  /**
   * Id of the visible heading the caller renders above the grid, so the cards
   * are labelled by it rather than by a hidden duplicate.
   */
  headingId: string;
}

/** The cards for one theme set, and nothing else. Null when there is nothing to show. */
export async function ThemeTourGrid({ theme, headingId }: ThemeTourGridProps) {
  if (!isNativeBookingEnabled()) return null;

  const { tours, degraded } = await loadThemeTours(theme);

  // A Regiondo outage on an editorial page should leave the page as it was,
  // not add an error box to it. The closing CTA still gets the reader to us.
  if (tours.length === 0) return null;

  return (
    <>
      <script {...jsonLdScriptProps(itemListJsonLd(tours, THEME_UPSELLS[theme].heading))} />
      <TourGrid tours={tours} degraded={degraded} priorityCount={0} headingId={headingId} />
    </>
  );
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
