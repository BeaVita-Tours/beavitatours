import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/tours/collection-page";
import { SITE_URL } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/regiondo/collections";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

/**
 * Private tours collection.
 *
 * A new URL, not a replacement for one. `/rates` has always been where private
 * tours were explained and priced, and the nav points there deliberately; this
 * page is the bookable catalog behind that pitch, linked from `/rates` rather
 * than displacing it.
 */

const collection = COLLECTIONS.private;

export const metadata: Metadata = {
  title: "Private day tours from Venice — Dolomites & Prosecco | Bea Vita Tours",
  description:
    "Private day trips from Venice with your own driver and vehicle: the Dolomites, Lake Sorapis, via ferrata with an alpine guide, and the Prosecco hills. Book direct.",
  alternates: { canonical: collection.href },
  openGraph: {
    type: "website",
    title: "Private day tours from Venice",
    description:
      "Your own vehicle, your own driver, your own pace — private day trips to the Dolomites and the Prosecco hills.",
    url: `${SITE_URL}${collection.href}`,
    siteName: "Bea Vita Tours",
  },
};

export default function PrivateToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isNativeBookingEnabled()) notFound();

  return (
    <CollectionPage
      heading={collection.heading}
      intro={collection.intro}
      title={collection.title}
      href={collection.href}
      tagId={collection.tagId}
      searchParams={searchParams}
      sibling={{
        label: "Prefer to join a small group? See our shared departures →",
        href: COLLECTIONS.shared.href,
      }}
    />
  );
}
