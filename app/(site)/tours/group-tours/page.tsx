import type { Metadata } from "next";

import { CollectionPage } from "@/components/tours/collection-page";
import { SITE_URL } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/regiondo/collections";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

import { LegacyGroupToursWidgetPage } from "./legacy-widget-page";

/**
 * Group / shared tours.
 *
 * The URL does not change — the nav, the homepage hero and the footer all
 * point at it. It is the native "Shared Tours from Venice" collection (tag
 * 45420), shown grouped under the four theme headings rather than as a flat
 * catalog — see `ThemedCollection`. With `REGIONDO_NATIVE_BOOKING` off it
 * falls back to the legacy Regiondo widget. See D-004.
 */

const collection = COLLECTIONS.shared;

export const metadata: Metadata = {
  title: "Group day tours from Venice — Dolomites & Prosecco Hills | beaVita Tours",
  description:
    "Join a small-group day trip from Venice: the Dolomites, Cortina, Lake Misurina, Lake Braies and the Prosecco hills. Maximum eight guests, hotel-free pickup at Piazzale Roma.",
  alternates: { canonical: collection.href },
  openGraph: {
    type: "website",
    title: "Group day tours from Venice",
    description:
      "Small-group day trips from Venice to the Dolomites and the Prosecco hills. Top rated on Tripadvisor, GetYourGuide and Viator.",
    url: `${SITE_URL}${collection.href}`,
    siteName: "beaVita Tours",
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
      title={collection.label}
      href={collection.href}
      tagId={collection.tagId}
      searchParams={searchParams}
      view="themed"
    />
  );
}
