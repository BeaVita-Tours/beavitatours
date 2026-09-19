import type { Metadata } from "next";

import { ThemeClosingCTA } from "@/components/tours/theme-cta";
import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import {
  type GalleryImage,
  TourCopy,
  TourDescription,
  TourSection,
  TourTemplate,
} from "@/components/tour-template";

const gallery: GalleryImage[] = [
  { src: "/imgs/winefood.jpg", alt: "Wine and food experience in Veneto" },
];

const proseccoGallery: GalleryImage[] = [
  { src: "/prosecco 2.jpg", alt: "Vineyard terraces in the Prosecco hills" },
  { src: "/prosecco 3.jpg", alt: "A glass of Prosecco at the winery" },
];

export const metadata: Metadata = {
  title: "Food, wine & Prosecco Hills day trips from Venice | beaVita Tours",
  description:
    "The Prosecco Hills, family-run wineries, local cheese and a long lunch in the Veneto hills. Small-group and private food & wine day trips from Venice.",
  alternates: { canonical: "/tours/wine-food" },
  openGraph: {
    type: "website",
    title: "Food, wine & Prosecco Hills day trips from Venice | beaVita Tours",
    description:
      "The Prosecco Hills, family-run wineries, local cheese and a long lunch in the Veneto hills. Small-group and private food & wine day trips from Venice.",
    url: `${SITE_URL}/tours/wine-food`,
    siteName: "beaVita Tours",
  },
};

/**
 * Food & Wine, with the Prosecco Hills folded in as its opening section —
 * the nav has one "Food & Wine" entry, and a separate Prosecco page beside it
 * was muddling the theme with one of its places. `/tours/prosecco` redirects
 * here (next.config.ts).
 *
 * The Prosecco departures sit in their own "Book a day trip" section under
 * the Prosecco copy, with the same eyebrow, heading and intro the Dolomites
 * page has — the client noticed this was the one theme without that
 * introduction (revision of 2026-09-15).
 */
export default function WineFoodTourPage() {
  return (
    <TourTemplate
      title="Food, wine & local flavours"
      subtitle="Taste Veneto, one glass and one table at a time."
      image="/tourwines.jpg"
      imageAlt="Food & Wine"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          From the Prosecco Hills to local flavours, discover the food, wine
          and traditions that make this part of Italy worth tasting. We take
          you to places we know first-hand — from family-run wineries to local
          producers and tables worth sitting down at.
        </p>
      </TourDescription>

      <TourSection
        id="prosecco"
        heading="Start with the Prosecco Hills"
        tagline="Rolling hills, small wineries and a glass of Prosecco in the place where it's made."
      >
        <TourCopy gallery={proseccoGallery}>
          <p className="leading-relaxed">
            The hills between Valdobbiadene and Conegliano — recognized by
            UNESCO in 2019 — are one of Veneto&apos;s most distinctive
            landscapes, and one of our favorite places to spend a day. We show
            them to you through tastings, local food and the stories of the
            growers who&apos;ve worked this land for generations.
          </p>
        </TourCopy>
      </TourSection>

      <ThemeUpsell theme="prosecco" />

      {/* No departures yet beyond the Prosecco ones — this section is the
          place for them when they exist. */}
      <TourSection
        id="more-than-wine"
        heading="More than wine"
        tagline="There is much more to taste in the Veneto region."
      >
        <TourCopy>
          <p className="leading-relaxed">
            From local wines and grappa (grape spirit) to aged cheeses and
            family recipes, our food &amp; wine tours are about getting to know
            the territory through what ends up on the table.
          </p>
          {/* Pink, on the client's request: a light wash of the coral accent. */}
          <p className="not-prose rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-base text-foreground">
            <span className="font-semibold">Fun fact:</span> tiramisù was
            invented just up the road, in Treviso.
          </p>
        </TourCopy>
      </TourSection>

      <ThemeClosingCTA page="wine-food" />
    </TourTemplate>
  );
}
