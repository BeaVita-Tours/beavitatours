import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo/metadata";

import { ThemeClosingCTA } from "@/components/tours/theme-cta";
import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import { type GalleryImage, TourTemplate } from "@/components/tour-template";

/** The four tastes of the region, in the order the client listed them. */
const tastes: (GalleryImage & { label: string })[] = [
  { src: "/tourprosecco.jpg", alt: "Prosecco poured on a terrace above the vineyards", label: "Prosecco" },
  { src: "/imgs/wine-food/tiramisu.jpg", alt: "A layered slice of tiramisù dusted with cocoa", label: "Tiramisù" },
  { src: "/imgs/wine-food/grappa.jpg", alt: "Clear grappa in tulip glasses", label: "Grappa" },
  { src: "/imgs/wine-food/spritz.jpg", alt: "A spritz beside a tray of cicchetti", label: "Spritz & cicchetti" },
];

const metadata: Metadata = {
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

// SEO Workspace's approved title, description and robots apply over these.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/tours/wine-food", metadata);
}

/**
 * Food & Wine, with the Prosecco Hills folded in — `/tours/prosecco`
 * redirects here (next.config.ts).
 *
 * Revision of 2026-09-29: the client wants every tour on the page to carry
 * the same weight, since new food & wine tours are coming in 2027. So the
 * Prosecco Hills and "More than wine" are one block of copy now, side by
 * side, then the fun fact, a row of four tastes, and a single "Book a day
 * trip" list for all the departures.
 */
export default function WineFoodTourPage() {
  return (
    <TourTemplate
      title="Wine, food & local flavors"
      subtitle="Taste Veneto, one glass and one table at a time."
      image="/tourwines.jpg"
      imageAlt="A table set for a wine tasting above the Prosecco hills"
    >
      <section className="bg-background py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-2 lg:gap-14">
              <TasteBlock
                id="prosecco"
                heading="Start with the Prosecco Hills"
                tagline="Rolling hills, small wineries and a glass of Prosecco in the place where it's made."
              >
                The hills between Valdobbiadene and Conegliano — recognized by UNESCO in 2019 —
                are one of Veneto&apos;s most distinctive landscapes, and one of our favorite
                places to spend a day. We show them to you through tastings, local food and the
                stories of the growers who&apos;ve worked this land for generations.
              </TasteBlock>
              <TasteBlock
                id="more-than-wine"
                heading="More than wine"
                tagline="There is much more to taste in the Veneto region."
              >
                From grappa and aged cheeses to spritz at golden hour and cicchetti at a bar
                counter, our food &amp; wine tours are about getting to know the territory through
                what ends up on the table.
              </TasteBlock>
            </div>

            {/* The client's "make this visible" box: full width, in the
                site's coral, bigger than the copy around it. */}
            <p className="mt-12 rounded-2xl border border-accent/40 bg-accent/15 px-6 py-5 text-center text-lg text-foreground md:text-xl">
              <span className="font-bold">Fun fact:</span> tiramisù was invented just up the road,
              in Treviso.
            </p>

            <ul aria-label="Tastes of the Veneto" className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {tastes.map((taste) => (
                <li key={taste.src}>
                  <figure className="space-y-2">
                    <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted">
                      <Image
                        src={taste.src}
                        alt={taste.alt}
                        fill
                        sizes="(min-width: 1152px) 276px, (min-width: 768px) 23vw, 46vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="text-center text-sm font-semibold text-foreground">
                      {taste.label}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ThemeUpsell theme="prosecco" />

      <ThemeClosingCTA page="wine-food" />
    </TourTemplate>
  );
}

function TasteBlock({
  id,
  heading,
  tagline,
  children,
}: {
  id: string;
  heading: string;
  tagline: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-3xl font-bold tracking-tight">
        {heading}
      </h2>
      <p className="text-pretty text-xl text-foreground/80">{tagline}</p>
      <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
