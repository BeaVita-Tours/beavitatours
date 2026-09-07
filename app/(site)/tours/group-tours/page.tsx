import type { Metadata } from "next";

import { CollectionPage } from "@/components/tours/collection-page";
import { SITE_URL } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/regiondo/collections";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

import { LegacyGroupToursWidgetPage } from "./legacy-widget-page";

/**
 * Group / shared tours.
 *
 * The URL does not change — this page hosts the Regiondo catalog widget today
 * and the nav's "Book Now", the homepage card and `/rates` all point at it. With
 * `REGIONDO_NATIVE_BOOKING` off it renders exactly what it renders now; with the
 * flag on it becomes the native "Shared Tours from Venice" collection (tag
 * 45420), which is what the page's own heading has always claimed to be.
 *
 * The widget currently lists a wider set than that tag, so the native version
 * narrows the page deliberately — with links out to `/tours` and
 * `/tours/private-tours` so nothing becomes unreachable. See D-004.
 */

const collection = COLLECTIONS.shared;

export const metadata: Metadata = {
  title: "Group day tours from Venice — Dolomites & Prosecco Hills | Bea Vita Tours",
  description:
    "Join a small-group day trip from Venice: the Dolomites, Cortina, Lake Misurina, Lake Braies and the Prosecco hills. Maximum eight guests, hotel-free pickup at Piazzale Roma.",
  alternates: { canonical: collection.href },
  openGraph: {
    type: "website",
    title: "Group day tours from Venice",
    description:
      "Small-group day trips from Venice to the Dolomites and the Prosecco hills. Top rated on Tripadvisor, GetYourGuide and Viator.",
    url: `${SITE_URL}${collection.href}`,
    siteName: "Bea Vita Tours",
  },
};

export default function GroupToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isNativeBookingEnabled()) return <LegacyGroupToursWidgetPage />;

  return (
    <CollectionPage
      heading={collection.heading}
      intro={collection.intro}
      title={collection.title}
      href={collection.href}
      tagId={collection.tagId}
      searchParams={searchParams}
      sibling={{
        label: "Want the day to yourself? See our private tours →",
        href: COLLECTIONS.private.href,
      }}
    />
  );
}
