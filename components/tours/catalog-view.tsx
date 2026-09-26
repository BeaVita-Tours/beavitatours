import { FilterPanel } from "@/components/tours/filter-panel";
import { TourGrid } from "@/components/tours/tour-grid";
import {
  applyDurationBand,
  type CatalogSearchParams,
  parseCatalogParams,
  toCatalogFilters,
} from "@/lib/regiondo/catalog-params";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

interface CatalogViewProps {
  basePath: string;
  /**
   * The promise, not the resolved value. Under Cache Components, awaiting
   * `searchParams` is what makes a component request-time — so it has to happen
   * *inside* the Suspense boundary, or the whole route becomes unprerenderable
   * and the page shell stops streaming.
   */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /** Pins the view to one collection, for a dedicated collection page. */
  forceCollectionId?: string;
  listName: string;
  emptyTitle?: string;
  emptyBody?: string;
}

/**
 * The reusable catalog: filters, grid, and the `ItemList` markup that makes a
 * filtered view legible to a crawler.
 *
 * Used by `/tours`, both collection pages and the `/lp/*` landing pages. It is
 * a Server Component with no client JavaScript of its own — the filters are
 * links and the cards are static — so dropping it onto a landing page costs
 * nothing in bundle size, which is the whole point for paid traffic.
 */
export async function CatalogView({
  basePath,
  searchParams,
  forceCollectionId,
  listName,
  emptyTitle,
  emptyBody,
}: CatalogViewProps) {
  const params = parseCatalogParams(await searchParams);

  const effective: CatalogSearchParams = forceCollectionId
    ? { ...params, collection: forceCollectionId }
    : params;

  const result = await listTours(toCatalogFilters(effective));

  const tours = applyDurationBand(result.tours, effective.duration);

  return (
    <div className="space-y-8">
      {tours.length > 0 ? <script {...jsonLdScriptProps(itemListJsonLd(tours, listName))} /> : null}

      <FilterPanel basePath={basePath} params={params} resultCount={tours.length} />

      <TourGrid
        tours={tours}
        degraded={result.degraded}
        priorityCount={1}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </div>
  );
}
