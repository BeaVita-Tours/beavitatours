import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TourGrid } from "@/components/tours/tour-grid";
import {
  isPrivateTour,
  THEME_PAGES,
  THEME_UPSELLS,
  type ThemePage,
} from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";
import type { TourSummary } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

interface ThemedCollectionProps {
  listName: string;
}

interface ThemeGroup {
  readonly page: ThemePage;
  readonly tours: readonly TourSummary[];
}

/**
 * The group tours, split by theme rather than shown as one flat list.
 *
 * Used by `/tours/group-tours` (the page "Book Now" opens). The client did not
 * want the departures repeated as a wall of cards, but offered under the
 * themes the homepage asks about — Dolomites, Food & Wine, Active & Adventure,
 * Culture & History — so the page answers "where?" the same way the rest of
 * the site does.
 *
 * **Each section is a Regiondo tag.** The client files a tour under
 * "Dolomites" or "Food & Wine" in the Regiondo dashboard and it appears under
 * that heading here (`tagId` on `THEME_PAGES`). Nothing is placed by a list in
 * this repo, and there is no catch-all "More day trips": a tour in neither tag
 * is not a group departure the client has filed, so it is not on the page.
 *
 * All four themes are always named, in the homepage order, each with a
 * one-line blurb and a link into its theme page (client revision,
 * 2026-09-15). A theme with no tag (`privateOnly`) is marked "Private only"
 * and shows the pointer instead of cards, so a private tour never sits on the
 * group page — nor does a private tour that someone tagged by mistake.
 *
 * Within a section the curated theme order is kept where the tour is in the
 * theme's set (shared, lower-priced first); anything else follows in the
 * order Regiondo returns it.
 *
 * No filters: a handful of tours under four headings does not need them.
 *
 * A Server Component with no client JavaScript, like `CatalogView`.
 */
export async function ThemedCollection({ listName }: ThemedCollectionProps) {
  const results = await Promise.all(
    THEME_PAGES.map(async (page: ThemePage) => {
      if (page.privateOnly || !page.tagId) return { page, tours: [], degraded: false };
      const { tours, degraded } = await listTours({ tag: page.tagId, limit: 250 });
      return { page, tours, degraded };
    })
  );

  const degraded = results.some((result) => result.degraded);

  const groups: ThemeGroup[] = results.map(({ page, tours }) => {
    const ids: readonly string[] = page.sets.flatMap((set) => THEME_UPSELLS[set].productIds);
    const rank = new Map(ids.map((id, index) => [id, index]));
    const members = tours
      .filter((tour) => !isPrivateTour(tour.id))
      // Array#sort is stable, so tours outside the curated set keep Regiondo's
      // order, after the ones that have a place in it.
      .sort(
        (a, b) =>
          (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    return { page, tours: members };
  });

  const listed = groups.flatMap((group) => group.tours);

  if (listed.length === 0 && degraded) {
    // The grid carries the "cannot reach the booking system" message.
    return <TourGrid tours={[]} degraded={degraded} regionLabel={listName} />;
  }

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
    </div>
  );
}
