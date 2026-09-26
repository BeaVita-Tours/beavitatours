import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

import { CollectionPage } from "@/components/tours/collection-page";
import { PrivateTourRates } from "@/components/tours/private-tour-rates";
import { SITE_URL } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/regiondo/collections";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

/**
 * Private tours: the bookable private departures, and beneath them the
 * tailor-made offer with its rates and inclusions.
 *
 * This is where the nav's "Private Tours" goes, and where the old `/rates`
 * page redirects. It renders with the native flag off too — without the
 * catalog, it is the tailor-made page that `/rates` used to be — so the nav
 * never points at a 404.
 */

const collection = COLLECTIONS.private;

const metadata: Metadata = {
  title: "Private day tours from Venice — Dolomites & Prosecco | beaVita Tours",
  description:
    "Private day trips from Venice with your own driver and vehicle: the Dolomites, Lake Sorapis, via ferrata with an alpine guide, and the Prosecco hills. Book direct, or ask for a tailor-made day.",
  alternates: { canonical: collection.href },
  openGraph: {
    type: "website",
    title: "Private day tours from Venice",
    description:
      "Your own vehicle, your own driver, your own pace — private day trips to the Dolomites and the Prosecco hills.",
    url: `${SITE_URL}${collection.href}`,
    siteName: "beaVita Tours",
  },
};

// SEO Workspace's approved title, description and robots apply over these.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/tours/private-tours", metadata);
}

export default function PrivateToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <CollectionPage
      heading={collection.heading}
      intro={collection.intro}
      title={collection.label}
      href={collection.href}
      tagId={collection.tagId}
      searchParams={searchParams}
      view={isNativeBookingEnabled() ? "catalog" : "none"}
    >
      <PrivateTourRates />
    </CollectionPage>
  );
}
