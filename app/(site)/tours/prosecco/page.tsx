import type { Metadata } from "next";

import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import {
  TourCTA,
  TourDescription,
  TourTemplate,
} from "@/components/tour-template";

/**
 * A Server Component since the booking upsell below is server-rendered. It was
 * `"use client"` only to host `TourTemplate`, which keeps its own directive —
 * so this page could not export metadata and inherited the site-wide title.
 */
export const metadata: Metadata = {
  title: "Prosecco Hills tours from Venice | Bea Vita Tours",
  description:
    "A UNESCO World Heritage landscape 45 minutes from Venice. Family-run wineries, hill towns and Prosecco tasting on a small-group or private day trip.",
  alternates: { canonical: "/tours/prosecco" },
  openGraph: {
    type: "website",
    title: "Prosecco Hills tours from Venice | Bea Vita Tours",
    description:
      "A UNESCO World Heritage landscape 45 minutes from Venice. Family-run wineries, hill towns and Prosecco tasting on a small-group or private day trip.",
    url: `${SITE_URL}/tours/prosecco`,
    siteName: "Bea Vita Tours",
  },
};

export default function ProseccoTourPage() {
  return (
    <TourTemplate
      name="The Prosecco Hills"
      title="The Prosecco Hills"
      subtitle="Explore the hills and finest wineries of the Prosecco region"
      badge="UNESCO World Heritage Site"
      image="/tourprosecco.jpg"
      imageAlt="The Prosecco Hills"
      ctaHeading="Ready to Experience The Prosecco Region?"
      ctaName="The Prosecco Hills"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Just a 45 minute drive from Venice lies the region of Prosecco,
          UNESCO World Heritage Site. The landscape is characterized by hills,
          forests, small villages and farmland. For centuries, this rough
          terrain has been shaped and adapted by man.
        </p>
        <p className="leading-relaxed">
          Thanks to its special terracing system, soil and terrain conservation
          techniques and viticultural practices, this hilly area has become one
          of the most beautiful and productive wine-growing areas in the world.
          Prosecco is Italy&apos;s most famous sparkling wine. Thanks to its
          informal yet refined character, has created a new style of drink.
        </p>
        <p className="leading-relaxed">
          But the Prosecco Hills are not just wine: they are also culture of
          taste, authentic hospitality, art, landscape, memory. Castles,
          villages, mills and abbeys: in the area of the Prosecco hills there
          is truly something to see for everyone.
        </p>
      </TourDescription>

      {/* Bookable departures for this theme, between the copy and the
          existing CTA. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="prosecco" />

      <TourCTA />
    </TourTemplate>
  );
}
