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
  { src: "/imgs/winefood.jpg", alt: "Wine and food experience in Veneto" },
];

export const metadata: Metadata = {
  title: "Wine and food day trips from Venice | Bea Vita Tours",
  description:
    "Prosecco at the winery that made it, local cheese and salami, and a long lunch in the Veneto hills. Small-group and private day trips from Venice.",
  alternates: { canonical: "/tours/wine-food" },
  openGraph: {
    type: "website",
    title: "Wine and food day trips from Venice | Bea Vita Tours",
    description:
      "Prosecco at the winery that made it, local cheese and salami, and a long lunch in the Veneto hills. Small-group and private day trips from Venice.",
    url: `${SITE_URL}/tours/wine-food`,
    siteName: "Bea Vita Tours",
  },
};

export default function WineFoodTourPage() {
  return (
    <TourTemplate
      title="Wine & Food"
      subtitle="A journey through the finest wines and authentic flavors of the Veneto region."
      badge="UNESCO World Heritage Site"
      image="/tourwines.jpg"
      imageAlt="Wine & Food"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          Italian cuisine, including its essential wine culture, is a UNESCO
          Heritage: a recognition of the art of Italian cooking as a social
          ritual of conviviality, shared practices, and deep connection to land
          and seasons, encompassing the entire food chain from cultivation to
          the table, with wine acting as a crucial bridge between traditions
          and generations.
        </p>
        <p className="leading-relaxed">
          Each region has its own specialities and offers food and wine tours
          to discover the varied and always tasty local cuisine. Veneto Region,
          thanks to its particular morphology including flat, mountainous and
          coastal areas, can boast a food and wine industry rich in a wide
          variety of specialties.
        </p>
        <p className="leading-relaxed">
          To whet your appetite we assist you in setting the table by giving
          your some tips for a perfect with tours and tastings off the
          well-trodden tourist track: undisturbed oases of tranquility able to
          cater for all your tastes and needs.
        </p>
      </TourDescription>

      {/* Every departure for this subject. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="wine-food" />

      <TourCTA heading="Ready for the ultimate day trip?" />
    </TourTemplate>
  );
}
