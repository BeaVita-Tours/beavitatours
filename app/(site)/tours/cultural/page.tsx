import type { Metadata } from "next";

import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import {
  type GalleryImage,
  TourCTA,
  TourDescription,
  TourTemplate,
} from "@/components/tour-template";

const gallery: GalleryImage[] = [
  { src: "/imgs/cultural/padova1.jpeg", alt: "Padova" },
  { src: "/imgs/cultural/verona1.jpeg", alt: "Verona" },
  { src: "/imgs/cultural/verona2.jpeg", alt: "Verona scenery" },
];

export const metadata: Metadata = {
  title: "Medieval hill towns of the Veneto | Bea Vita Tours",
  description:
    "Asolo, Cison di Valmarino and the walled villages of the Veneto. Castles, medieval streets and wine on a day trip from Venice.",
  alternates: { canonical: "/tours/cultural" },
  openGraph: {
    type: "website",
    title: "Medieval hill towns of the Veneto | Bea Vita Tours",
    description:
      "Asolo, Cison di Valmarino and the walled villages of the Veneto. Castles, medieval streets and wine on a day trip from Venice.",
    url: `${SITE_URL}/tours/cultural`,
    siteName: "Bea Vita Tours",
  },
};

export default function CulturalTourPage() {
  return (
    <TourTemplate
      title="Cultural"
      subtitle="Veneto enchants with its immense artistic and historical heritage"
      badge="UNESCO World Heritage Site"
      image="/gallaplacidia.webp"
      imageAlt="Cultural"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          Veneto, for the richness of its historical and artistic patrimony and
          for the completeness of its offers, is the destination of choice for
          tourists sensible to history, art, and traditions. Cultural routes
          are countless. 7 art cities and 9 Unesco Heritage sites are only a
          small part of the huge artistic tradition of this region.
        </p>
        <p className="leading-relaxed">
          Every city is an art heritage city: from the main ones such as
          Venice, Verona, Padua and Treviso, to the walled cities such as
          Marostica, Montagnana, Asolo and Bassano del Grappa and the small
          towns such as Feltre and Soave. Each one is a slice of the history of
          our region, rich in beauty spots for you to visit and experience.
        </p>
        <p className="leading-relaxed">
          Ancient palaces, museums and castles tells thousands of years of
          history, guardians of a rich past. Local museums are plenty of
          priceless treasures displaying different eras and traditions.
        </p>
      </TourDescription>

      {/* Every departure for this subject. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="cultural" />

      <TourCTA heading="Ready to explore Veneto's cultural heritage?" />
    </TourTemplate>
  );
}
