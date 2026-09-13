import { Suspense } from "react";
import type { Metadata } from "next";

import { EscapeLandingPage } from "@/components/landing/escape-landing-page";
import { LandingCatalog } from "@/components/tours/landing-catalog";
import { TourGridSkeleton } from "@/components/tours/tour-grid";
import { SITE_URL } from "@/lib/constants";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

/**
 * Paid landing page — Jesolo and Cavallino departures.
 *
 * See the sibling page at /lp/from-venice for why this is a Server Component
 * and what the native booking slot replaces.
 */

export const metadata: Metadata = {
  title: "Day trips from Jesolo & Cavallino — Dolomites & Prosecco | beaVita Tours",
  description:
    "Private day tours from Jesolo and Cavallino to the Dolomites and the Prosecco hills. Picked up from your accommodation, run by the local operator.",
  alternates: { canonical: "/lp/from-jesolo-cavallino" },
  openGraph: {
    type: "website",
    title: "Escape the beach for a day: Dolomites & Prosecco await",
    description:
      "Swap the sun lounger for mountain peaks and vineyard hills — your day trip starts from Jesolo or Cavallino.",
    url: `${SITE_URL}/lp/from-jesolo-cavallino`,
    siteName: "beaVita Tours",
  },
};

export default function FromJesoloCavallinoLandingPage() {
  const native = isNativeBookingEnabled();

  return (
    <EscapeLandingPage
      heroTitle="Escape the beach for a day: Dolomites & Prosecco await"
      heroSubtitle="Swap the sun lounger for mountain peaks and vineyard hills — your day trip starts from Jesolo or Cavallino."
      {...(native
        ? {
            bookingSlot: (
              <Suspense fallback={<TourGridSkeleton count={2} />}>
                <LandingCatalog
                  landing="from-jesolo-cavallino"
                  listName="Day trips from Jesolo and Cavallino"
                />
              </Suspense>
            ),
          }
        : {
            widgetUrl:
              "https://prosecco-experience.regiondo.com/categories?tag=escape-from-jesolo-cavallino",
          })}
    />
  );
}
