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

export default function DolomitesTourPage() {
  return (
    <TourTemplate
      title="The Dolomites"
      subtitle="Discover the Dolomites, the most beautiful mountains in the World"
      badge="UNESCO World Heritage Site"
      image="/imgs/dolomites/dolomitesmain.jpeg"
      imageAlt="The Dolomites"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          The site of the Dolomites comprises a mountain range in the northern
          Italian Alps, featuring some of the most attractive mountain
          landscapes in the world, with vertical walls, sheer cliffs and a
          high density of narrow, deep and long valleys.
        </p>
        <p className="leading-relaxed">
          The beauty and diversity of the Italian Dolomites alone will enchant
          you in every season. An abundance of natural treasures, UNESCO World
          Heritage site and magnificent views. Not forgetting cultural sights
          such as castles, museums and churches.
        </p>
        <p className="leading-relaxed">
          Breathtaking Dolomites cable cars offer iconic views, with top
          contenders including the Lagazuoi cable car for its vast panoramas,
          the Marmolada cable car reaching the &quot;Queen of the
          Dolomites,&quot; and the Sass Pordoi cable car, in the heart of the
          Sella Group. Each offers unique perspectives of jagged peaks, alpine
          meadows and landscapes.
        </p>
      </TourDescription>

      {/* Every departure for this subject. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="dolomites" />

      <TourCTA heading="Ready to explore the Dolomites?" />
    </TourTemplate>
  );
}
