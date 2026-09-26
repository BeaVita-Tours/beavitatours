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
  href: string;
  /** Pins the catalog to one Regiondo tag. Omit on `/tours`. */
  tagId?: string;
  /** Passed through unresolved so the await happens inside Suspense. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /**
   * What sits under the header: the filterable catalog (default), the same
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
  href,
  tagId,
  searchParams,
  view = "catalog",
  children,
}: CollectionPageProps) {
  return (
    <main className="container mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 max-w-2xl space-y-3">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{heading}</h1>
        {(typeof intro === "string" ? [intro] : intro).map((paragraph) => (
          <p key={paragraph} className="text-lg text-muted-foreground">
            {paragraph}
          </p>
        ))}
        {lead ? <p className="text-lg font-semibold text-foreground">{lead}</p> : null}
      </header>

      {view === "catalog" ? (
        <div className="space-y-8">
          <Suspense fallback={<TourGridSkeleton />}>
            <CatalogView
              basePath={href}
              searchParams={searchParams}
              forceCollectionId={tagId}
              listName={title}
              emptyTitle="No tours match those filters"
              emptyBody="Try clearing a filter."
            />
          </Suspense>
        </div>
      ) : null}

      {view === "themed" && tagId ? (
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
