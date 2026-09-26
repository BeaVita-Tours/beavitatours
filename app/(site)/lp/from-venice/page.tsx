import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

import { EscapeLandingPage } from "@/components/landing/escape-landing-page";
import { LandingCatalog } from "@/components/tours/landing-catalog";
import { TourGridSkeleton } from "@/components/tours/tour-grid";
import { SITE_URL } from "@/lib/constants";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

/**
 * Paid landing page — Venice departures.
 *
 * This is now a Server Component. It was `"use client"` purely so it could
 * render the client shell, which meant it could not export metadata and
 * inherited the site-wide title verbatim — on a page bought traffic lands on.
 * The shell keeps its own `"use client"`; only the page wrapper moved.
 *
 * With the flag on, the Regiondo iframe is replaced by a server-rendered tour
 * grid. That removes a cross-origin document, its stylesheet and its scripts
 * from the critical path of the page where interaction latency costs the most.
 */

const metadata: Metadata = {
  title: "Escape Venice for a day — Dolomites & Prosecco tours | beaVita Tours",
  description:
    "Day trips from Venice to the Dolomites, Lake Braies, Cortina and the Prosecco hills. Book direct with the licensed local operator — no booking fees, free cancellation.",
  alternates: { canonical: "/lp/from-venice" },
  openGraph: {
    type: "website",
    title: "Escape Venice for a day: Dolomites & Prosecco await",
    description:
      "Trade the crowds and canals for mountain peaks and vineyard hills — just a short drive from the city.",
    url: `${SITE_URL}/lp/from-venice`,
    siteName: "beaVita Tours",
  },
};

// SEO Workspace's approved title, description and robots apply over these.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/lp/from-venice", metadata);
}

export default function FromVeniceLandingPage() {
  const native = isNativeBookingEnabled();

  return (
    <EscapeLandingPage
      heroTitle="Escape Venice for a day: Dolomites & Prosecco await"
      heroSubtitle="Trade the crowds and canals for mountain peaks and vineyard hills — just a short drive from the city."
      {...(native
        ? {
            bookingSlot: (
              <Suspense fallback={<TourGridSkeleton count={3} />}>
                <LandingCatalog landing="from-venice" listName="Day trips from Venice" />
              </Suspense>
            ),
          }
        : {
            widgetUrl:
              "https://prosecco-experience.regiondo.com/categories?tag=escape-venice-for-a-day",
          })}
    />
  );
}
