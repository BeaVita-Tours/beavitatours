import { Suspense } from "react";

import { CatalogView } from "@/components/tours/catalog-view";
import { ThemedCollection } from "@/components/tours/themed-collection";
import { TourGridSkeleton } from "@/components/tours/tour-grid";

interface CollectionPageProps {
  heading: string;
  /** One paragraph, or several. */
  intro: string | readonly string[];
  /** A closing line under the intro, set in bold. */
  lead?: string;
  /** Short name for the ItemList markup. */
  title: string;
  /** The Regiondo tag the page lists. */
  tagId: string;
  /**
   * What sits under the header: the collection as one grid (default), the same
   * tours grouped under the four theme headings (`/tours/group-tours`), or
   * nothing — `/tours/private-tours` while the native flow is off, when the
   * tailor-made offer below is the whole page.
   */
  view?: "catalog" | "themed" | "none";
  /** Extra sections after the grid, e.g. the tailor-made offer. */
  children?: React.ReactNode;
}

/**
 * The shared shell for the two collection pages, `/tours/group-tours` and
 * `/tours/private-tours`.
 *
 * They are one list viewed two ways; the navbar is what moves you between
 * them, so there is no breadcrumb (client request — and the "Tours" index it
 * used to point at no longer exists). The heading and intro are per-page so
 * each is a genuinely different document rather than the same one filtered —
 * which matters when the whole reason the collection pages exist is to rank.
 */
export function CollectionPage({
  heading,
  intro,
  lead,
  title,
  tagId,
  view = "catalog",
  children,
}: CollectionPageProps) {
  return (
    <main className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 max-w-2xl space-y-3">
        {/* One sentence per line, wider than the intro: left to wrap in the
            intro's measure, "Beyond Venice, with good company. Come along
            for the ride." ended on a lone "ride." on desktop. */}
        <h1 className="text-4xl font-bold tracking-tight md:w-max md:max-w-4xl md:text-5xl">
          {heading.split(/(?<=\.)\s+/).map((sentence) => (
            <span key={sentence} className="block text-balance">
              {sentence}
            </span>
          ))}
        </h1>
        {(typeof intro === "string" ? [intro] : intro).map((paragraph) => (
          <p key={paragraph} className="text-pretty text-lg text-muted-foreground">
            {paragraph}
          </p>
        ))}
        {lead ? <p className="text-lg font-semibold text-foreground">{lead}</p> : null}
      </header>

      {view === "catalog" ? (
        <Suspense fallback={<TourGridSkeleton />}>
          <CatalogView
            tagId={tagId}
            listName={title}
            emptyTitle="No departures online right now"
            emptyBody="Ask us for a tailor-made day instead."
          />
        </Suspense>
      ) : null}

      {view === "themed" ? (
        <Suspense fallback={<TourGridSkeleton />}>
          <ThemedCollection tagId={tagId} listName={title} />
        </Suspense>
      ) : null}

      {/* A rule between the bookable departures and whatever follows (the
          tailor-made offer), so the two read as separate sections. */}
      {children ? (
        <div className={view === "none" ? "mt-4" : "mt-16 border-t border-border pt-16"}>
          {children}
        </div>
      ) : null}
    </main>
  );
}
