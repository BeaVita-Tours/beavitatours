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
  { src: "/prosecco 2.jpg", alt: "Vineyard terraces in the Prosecco hills" },
  { src: "/prosecco 3.jpg", alt: "A glass of Prosecco at the winery" },
];

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
      title="The Prosecco Hills"
      subtitle="Explore the hills and finest wineries of the Prosecco region"
      badge="UNESCO World Heritage Site"
      image="/tourprosecco.jpg"
      imageAlt="The Prosecco Hills"
    >
      <TourDescription gallery={gallery}>
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

      {/* Every departure for this subject. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="prosecco" />

      <TourCTA heading="Ready to experience the Prosecco region?" />
    </TourTemplate>
  );
}
