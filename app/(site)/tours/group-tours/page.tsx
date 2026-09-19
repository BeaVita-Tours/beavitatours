import type { Metadata } from "next";
import Link from "next/link";

import { CollectionPage } from "@/components/tours/collection-page";
import { Button } from "@/components/ui/button";
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
 *
 * Closes with a "Ready to book?" band pointing at the private tours (client
 * revision, 2026-09-15) — the page had no ending before it.
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
      lead={collection.lead}
      title={collection.label}
      href={collection.href}
      tagId={collection.tagId}
      searchParams={searchParams}
      view="themed"
    >
      <section
        aria-labelledby="group-tours-closing"
        className="rounded-2xl bg-primary-strong px-6 py-12 text-center text-primary-foreground md:px-12"
      >
        <h2 id="group-tours-closing" className="mb-4 text-3xl font-bold tracking-tight">
          Ready to book?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg">
          Pick a tour above, or explore our private tours if you&apos;d rather have the day to
          yourselves.
        </p>
        <Button asChild size="lg" variant="secondary" className="px-8 text-base">
          <Link href={COLLECTIONS.private.href}>Explore private tours</Link>
        </Button>
      </section>
    </CollectionPage>
  );
}
