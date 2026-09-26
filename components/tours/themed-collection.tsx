import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TourGrid } from "@/components/tours/tour-grid";
import { THEME_PAGES, THEME_UPSELLS, type ThemePage } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";
import type { TourSummary } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

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
 * All four themes are always listed, in the homepage order, each with a
 * one-line blurb and a link into its theme page (client revision,
 * 2026-09-15). A theme sold as private days only (`privateOnly`) is still
 * named — it exists, and group departures may come — but is marked "Private
 * only" and shows the pointer instead of cards, so a private tour never sits
 * on the group page.
 *
 * Membership comes from the curated theme sets (`THEME_UPSELLS`) via the
 * page → sets map (`THEME_PAGES`), so a tour is grouped exactly where its theme
 * page lists it. Anything in the collection that no theme claims falls into a
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

  const groups: ThemeGroup[] = THEME_PAGES.map((page: ThemePage) => {
    const ids: readonly string[] = page.sets.flatMap((set) => THEME_UPSELLS[set].productIds);
    const rank = new Map(ids.map((id, index) => [id, index]));
    const members = tours
      .filter((tour) => rank.has(tour.id))
      .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
    // A private-only theme's tours are claimed (so they do not resurface
    // under "More day trips") but not shown.
    return { page, tours: page.privateOnly ? [] : members };
  });

  const claimed = new Set<string>(
    THEME_PAGES.flatMap((page) => page.sets.flatMap((set) => THEME_UPSELLS[set].productIds))
  );
  const unplaced = tours.filter((tour) => !claimed.has(tour.id));
  const listed = groups.flatMap((group) => group.tours).concat(unplaced);

  return (
    <div className="space-y-14">
      <script {...jsonLdScriptProps(itemListJsonLd(listed, listName))} />

      {groups.map(({ page, tours: members }) => (
        <section key={page.slug} aria-labelledby={`theme-${page.slug}`}>
          <div className="mb-6 max-w-2xl space-y-2">
            <h2 id={`theme-${page.slug}`} className="text-2xl font-bold tracking-tight md:text-3xl">
              {page.title}
              {page.privateOnly ? (
                <span className="font-medium text-muted-foreground">
                  {" "}
                  · <span className="whitespace-nowrap">Private only</span>
                </span>
              ) : null}
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">{page.blurb}</p>
          </div>

          {members.length > 0 ? (
            <TourGrid tours={members} degraded={degraded} headingId={`theme-${page.slug}`} />
          ) : null}

          <Link
            href={page.href}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              members.length > 0 && "mt-6"
            )}
          >
            Explore {page.title} tours
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
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
