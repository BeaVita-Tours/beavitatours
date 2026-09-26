import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

import { ThemeClosingCTA } from "@/components/tours/theme-cta";
import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import {
  type GalleryImage,
  TourDescription,
  TourTagList,
  TourTemplate,
} from "@/components/tour-template";

const gallery: GalleryImage[] = [
  { src: "/imgs/cultural/padova1.jpeg", alt: "Padova" },
  { src: "/imgs/cultural/verona1.jpeg", alt: "Verona" },
  { src: "/imgs/cultural/verona2.jpeg", alt: "Verona scenery" },
];

const towns = [
  "Verona",
  "Padua",
  "Treviso",
  "Marostica",
  "Montagnana",
  "Asolo",
  "Bassano del Grappa",
  "Feltre",
  "Soave",
] as const;

const metadata: Metadata = {
  title: "Culture & history day trips from Venice | beaVita Tours",
  description:
    "Verona, Padua, Treviso and the walled towns of the Veneto — art, history, castles and medieval streets on a private day trip from Venice, built around what interests you.",
  alternates: { canonical: "/tours/cultural" },
  openGraph: {
    type: "website",
    title: "Culture & history day trips from Venice | beaVita Tours",
    description:
      "Verona, Padua, Treviso and the walled towns of the Veneto — art, history, castles and medieval streets on a private day trip from Venice, built around what interests you.",
    url: `${SITE_URL}/tours/cultural`,
    siteName: "beaVita Tours",
  },
};

// SEO Workspace's approved title, description and robots apply over these.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/tours/cultural", metadata);
}

/**
 * "Culture & History" — the client's rename of what the site called
 * "Cultural". The URL stays `/tours/cultural`; it is linked and indexed.
 */
export default function CulturalTourPage() {
  return (
    <TourTemplate
      title="Culture & History"
      subtitle="See the Veneto region through the stories that shaped it."
      image="/gallaplacidia.webp"
      imageAlt="Culture & History"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          Art, history, architecture and local traditions — tell us what
          interests you, and we&apos;ll help you build a private day around
          it.
        </p>
        <p className="leading-relaxed">
          From the streets of Verona, Padua and Treviso to the walled towns of
          Marostica, Montagnana, Asolo and Bassano del Grappa, there is plenty
          beyond Venice worth a day of its own. You might want to explore a
          medieval town, visit a castle, spend time in a museum or simply
          wander through a place with a story to tell.
        </p>
        <p className="leading-relaxed">
          You choose what catches your interest. We take care of putting the
          day together.
        </p>
        <TourTagList label="Some of the towns we love" items={towns} />
      </TourDescription>

      <ThemeUpsell theme="cultural" />

      <ThemeClosingCTA
        page="cultural"
        privateCopy={{
          description:
            "Tell us what you're interested in — art, history, architecture, traditions or a particular place — and we'll help you plan your private day from Venice.",
          action: "Plan your private cultural tour",
        }}
      />
    </TourTemplate>
  );
}
