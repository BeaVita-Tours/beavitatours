import { TourGrid } from "@/components/tours/tour-grid";
import { LANDING_PRODUCT_SETS, type LandingKey } from "@/lib/regiondo/collections";
import { listTours } from "@/lib/regiondo/products";
import { itemListJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

/**
 * The tour grid for a paid landing page.
 *
 * Deliberately simpler than `CatalogView`: no filters, no sort, no search
 * params. These pages are the end of an ad click, and every control is one more
 * decision between arrival and booking. The set is fixed to match what the
 * iframe shows today and the cards go straight to the tour page.
 *
 * Server Component with no client JavaScript, which is the substance of the
 * performance claim: it replaces a proxied cross-origin iframe (its own
 * document, its own stylesheet, its own scripts, an 800px reserved box) with
 * server-rendered HTML and a handful of images.
 */
export async function LandingCatalog({
  landing,
  listName,
}: {
  landing: LandingKey;
  listName: string;
}) {
  const productIds = LANDING_PRODUCT_SETS[landing];

  const { tours, degraded } = await listTours({
    productIds,
    limit: 250,
    sort: "popular",
  });

  // Preserve the configured order — it is the running order the landing page
  // was built around, and `/products` returns its own.
  const ordered = [...tours].sort(
    (a, b) => productIds.indexOf(a.id as never) - productIds.indexOf(b.id as never)
  );

  return (
    <div className="space-y-6">
      {ordered.length > 0 ? (
        <script {...jsonLdScriptProps(itemListJsonLd(ordered, listName))} />
      ) : null}

      <TourGrid
        tours={ordered}
        degraded={degraded}
        priorityCount={0}
        emptyTitle="No departures available right now"
        emptyBody="Get in touch and we will find you a date."
      />
    </div>
  );
}
