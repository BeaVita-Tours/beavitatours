import { TourGrid } from "@/components/tours/tour-grid";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

interface CatalogViewProps {
  /** The Regiondo tag whose tours are listed. */
  tagId: string;
  listName: string;
  emptyTitle?: string;
  emptyBody?: string;
}

/**
 * One collection as a flat grid, with the `ItemList` markup for crawlers.
 *
 * Used by `/tours/private-tours`. It had price and length filters until the
 * client's revision of 2026-09-29: the collection is a handful of tours, and
 * the filter row was one more thing between the reader and the cards.
 *
 * A Server Component with no client JavaScript — the cards are static and the
 * links are links.
 */
export async function CatalogView({ tagId, listName, emptyTitle, emptyBody }: CatalogViewProps) {
  const { tours, degraded } = await listTours({ tag: tagId, sort: "popular", limit: 250 });

  return (
    <div className="space-y-8">
      {tours.length > 0 ? <script {...jsonLdScriptProps(itemListJsonLd(tours, listName))} /> : null}

      <TourGrid
        tours={tours}
        degraded={degraded}
        priorityCount={1}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </div>
  );
}
