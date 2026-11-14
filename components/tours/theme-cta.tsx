import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  type CollectionKey,
  isPrivateTour,
  THEME_UPSELLS,
  type ThemePageSlug,
  themePage,
} from "@/lib/regiondo/collections";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { listTours } from "@/lib/regiondo/products";
import { closingBandFor, type PrivateCopy } from "@/lib/regiondo/theme-cta";

/**
 * The closing band of a theme page, adapted to how that theme can be booked.
 *
 * Which of the theme's departures are group and which are private decides the
 * band: the theme's product set is fetched (so only tours that are active in
 * Regiondo count), each one is private if it is in `PRIVATE_PRODUCT_IDS` and a
 * group departure otherwise, and `closingBandFor` picks the heading and cards
 * for whichever routes come back non-empty. (The Regiondo tags are the client's
 * themes now, so they say nothing about group versus private.)
 *
 * A theme marked `privateOnly` in `THEME_PAGES` is an editorial fact, so it
 * wins over the catalog.
 *
 * The private card's copy can be given per page, because the client wrote a
 * line for each private-only theme ("Plan your private adventure").
 *
 * A Server Component. The two catalog calls share the `"use cache"` catalog
 * profile with the upsell above it.
 */

const EVERYTHING: ReadonlySet<CollectionKey> = new Set<CollectionKey>(["shared", "private"]);

/** Which collections a theme's product set has departures in. */
async function travelStylesFor(page: ThemePageSlug): Promise<ReadonlySet<CollectionKey>> {
  const theme = themePage(page);
  if (theme.privateOnly) return new Set<CollectionKey>(["private"]);

  const productIds = theme.sets.flatMap((set) => THEME_UPSELLS[set].productIds);
  const styles = new Set<CollectionKey>();

  const { tours } = await listTours({ productIds, limit: 250 });
  for (const tour of tours) styles.add(isPrivateTour(tour.id) ? "private" : "shared");

  return styles;
}

export async function ThemeClosingCTA({
  page,
  privateCopy,
}: {
  page: ThemePageSlug;
  /** Copy for the private card, when the page has its own line for it. */
  privateCopy?: PrivateCopy;
}) {
  const styles = isNativeBookingEnabled() ? await travelStylesFor(page) : EVERYTHING;
  const { heading, options } = closingBandFor(styles, privateCopy);

  return (
    /*
      --primary-strong rather than --primary: the lighter brand teal gives this
      band's near-white text 2.5:1, below AA. The deeper stop is 4.53:1 and is
      the same colour family.
    */
    <section
      aria-labelledby="theme-closing-cta"
      className="bg-primary-strong py-16 text-primary-foreground"
    >
      <div className="container mx-auto px-4">
        <h2 id="theme-closing-cta" className="mb-10 text-center text-3xl font-bold tracking-tight">
          {heading}
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {options.map((option) => (
            <div
              key={option.href}
              className="flex flex-col items-start gap-4 rounded-2xl bg-primary-foreground/10 p-8"
            >
              <h3 className="text-2xl font-bold">{option.title}</h3>
              {/* Full opacity: at /90 this measured 2.3:1 even on the deeper teal. */}
              <p className="text-pretty text-lg text-primary-foreground">{option.description}</p>
              <Button asChild size="lg" variant="secondary" className="mt-auto">
                <Link href={option.href}>{option.action}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
