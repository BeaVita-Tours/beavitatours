import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TourGrid } from "@/components/tours/tour-grid";
import { THEME_PAGES, THEME_UPSELLS, type ThemePage } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";
import type { TourSummary } from "@/lib/regiondo/types";

interface ThemedCollectionProps {
  /** The Regiondo tag whose tours are grouped. */
  tagId: string;
  listName: string;
}

interface ThemeGroup {
  readonly page: ThemePage;
  readonly tours: readonly TourSummary[];
}

/**
 * A collection split by theme rather than shown as one flat list.
 *
 * Used by `/tours/group-tours`: the client did not want the shared departures
 * repeated as a wall of cards, but offered under the four themes the homepage
 * asks about — Dolomites, Food & Wine, Active & Adventure, Culture & History —
 * so the page answers "where?" the same way the rest of the site does.
 *
 * Membership comes from the curated theme sets (`THEME_UPSELLS`) via the
 * page → sets map (`THEME_PAGES`), so a tour is grouped exactly where its theme
 * page lists it. A theme with no departure in this collection is simply not
 * shown (two of the four are private-only today) — no empty heading, no
 * placeholder. Anything in the collection that no theme claims falls into a
 * trailing "More day trips" group rather than vanishing.
 *
 * No filters: the collection is five or six tours, and a filter panel over a
 * page that already sorts itself into four headings would be noise.
 *
 * A Server Component with no client JavaScript, like `CatalogView`.
 */
export async function ThemedCollection({ tagId, listName }: ThemedCollectionProps) {
  const { tours, degraded } = await listTours({ tag: tagId, limit: 250 });

  if (tours.length === 0) {
    // The grid carries the "cannot reach the booking system" message.
    return <TourGrid tours={[]} degraded={degraded} regionLabel={listName} />;
  }

  const groups: ThemeGroup[] = THEME_PAGES.map((page) => {
    const ids: readonly string[] = page.sets.flatMap((set) => THEME_UPSELLS[set].productIds);
    const rank = new Map(ids.map((id, index) => [id, index]));
    const members = tours
      .filter((tour) => rank.has(tour.id))
      .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
    return { page, tours: members };
  }).filter((group) => group.tours.length > 0);

  const placed = new Set(groups.flatMap((group) => group.tours.map((tour) => tour.id)));
  const unplaced = tours.filter((tour) => !placed.has(tour.id));

  return (
    <div className="space-y-14">
      <script {...jsonLdScriptProps(itemListJsonLd(tours, listName))} />

      {groups.map(({ page, tours: members }) => (
        <section key={page.slug} aria-labelledby={`theme-${page.slug}`}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 id={`theme-${page.slug}`} className="text-2xl font-bold tracking-tight md:text-3xl">
              {page.title}
            </h2>
            <Link
              href={page.href}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              About {page.title}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <TourGrid tours={members} degraded={degraded} headingId={`theme-${page.slug}`} />
        </section>
      ))}

      {unplaced.length > 0 ? (
        <section aria-labelledby="theme-more">
          <h2 id="theme-more" className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">
            More day trips
          </h2>
          <TourGrid tours={unplaced} degraded={degraded} headingId="theme-more" />
        </section>
      ) : null}
    </div>
  );
}
