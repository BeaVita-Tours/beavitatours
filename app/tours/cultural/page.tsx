"use client";

import {
  TourCTA,
  TourDescription,
  TourTemplate,
  type CarouselImage,
} from "@/components/tour-template";

const carouselImages: CarouselImage[] = [
  { src: "/imgs/cultural/padova1.jpeg", alt: "Padova" },
  { src: "/imgs/cultural/verona1.jpeg", alt: "Verona" },
  { src: "/imgs/cultural/verona2.jpeg", alt: "Verona scenery" },
];

export default function CulturalTourPage() {
  return (
    <TourTemplate
      name="Cultural"
      title="Cultural"
      subtitle="Veneto enchants with its immense artistic and historical heritage"
      image="/gallaplacidia.webp"
      imageAlt="Cultural Heritage in Veneto"
      carouselImages={carouselImages}
      ctaHeading="Ready to Explore Veneto's Cultural Heritage?"
      ctaName="Cultural"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Veneto, for the richness of its historical and artistic patrimony and
          for the completeness of its offers, is the destination of choice for
          tourists sensible to history, art, and traditions. Cultural routes are
          countless. 7 art cities and 9 Unesco Heritage sites are only a small
          part of the huge artistic tradition of this region.
        </p>
        <p className="leading-relaxed">
          Every city is an art heritage city: from the main ones such as Venice,
          Verona, Padua and Treviso, to the walled cities such as Marostica,
          Montagnana, Asolo and Bassano del Grappa and the small towns such as
          Feltre and Soave. Each one is a slice of the history of our region,
          rich in beauty spots for you to visit and experience.
        </p>
        <p className="leading-relaxed">
          Ancient palaces, museums and castles tells thousands of years of
          history, guardians of a rich past. Local museums are plenty of
          priceless treasures displaying different eras and traditions.
        </p>
      </TourDescription>

      <TourCTA />
    </TourTemplate>
  );
}
