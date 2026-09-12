import type { Metadata } from "next";

import { ThemeClosingCTA } from "@/components/tours/theme-cta";
import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import { type GalleryImage, TourDescription, TourTemplate } from "@/components/tour-template";

const gallery: GalleryImage[] = [
  { src: "/imgs/dolomites/dolomites1.jpeg", alt: "Dolomites landscape" },
  { src: "/imgs/dolomites/dolomites2.jpeg", alt: "Dolomites panorama" },
];

export const metadata: Metadata = {
  title: "Dolomites day trips from Venice | Bea Vita Tours",
  description:
    "The Dolomites are two hours from Venice. Cortina, Lake Misurina, Lake Braies and Tre Cime — small-group and private day trips, back the same evening.",
  alternates: { canonical: "/tours/dolomites" },
  openGraph: {
    type: "website",
    title: "Dolomites day trips from Venice | Bea Vita Tours",
    description:
      "The Dolomites are two hours from Venice. Cortina, Lake Misurina, Lake Braies and Tre Cime — small-group and private day trips, back the same evening.",
    url: `${SITE_URL}/tours/dolomites`,
    siteName: "Bea Vita Tours",
  },
};

/**
 * Structure agreed with the client (revision of 2026-09-11): the copy, then
 * every Dolomites departure, then the closing band — which offers group and
 * private according to what the catalog actually has for this theme.
 */
export default function DolomitesTourPage() {
  return (
    <TourTemplate
      title="The Dolomites, the way we know them."
      subtitle="Jagged peaks, mountain lakes, quiet villages and roads worth taking slowly."
      badge="UNESCO World Heritage Site"
      image="/imgs/dolomites/dolomitesmain.jpeg"
      imageAlt="The Dolomites"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          We know the Dolomites not just from the viewpoints, but from the
          roads that connect them: the way into Cortina, the still water at
          Lake Misurina, the turquoise chill of Lake Braies, and the villages
          worth a slow stop along the way — and the people who live among
          them.
        </p>
      </TourDescription>

      <ThemeUpsell theme="dolomites" />

      <ThemeClosingCTA page="dolomites" />
    </TourTemplate>
  );
}
