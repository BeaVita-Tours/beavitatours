"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
  type CarouselImage,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";

const carouselImages: CarouselImage[] = [
  { src: "/imgs/dolomites/dolomites1.jpeg", alt: "Dolomites landscape" },
  { src: "/imgs/dolomites/dolomites2.jpeg", alt: "Dolomites panorama" },
];

export default function DolomitesTourPage() {
  return (
    <TourTemplate
      name="The Dolomites"
      title="The Dolomites"
      subtitle="Discover the Dolomites, the most beautiful mountains in the World"
      badge="UNESCO World Heritage Site"
      image="/imgs/dolomites/dolomitesmain.jpeg"
      imageAlt="Dolomites Mountains"
      carouselImages={carouselImages}
      ctaHeading="Ready to Explore the Dolomites?"
      ctaName="Dolomites"
    >
      <TourDescription>
        <p className="leading-relaxed">
          The site of the Dolomites comprises a mountain range in the northern
          Italian Alps, featuring some of the most attractive mountain
          landscapes in the world, with vertical walls, sheer cliffs and a high
          density of narrow, deep and long valleys.
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
          the Marmolada cable car reaching the "Queen of the Dolomites," and the
          Sass Pordoi cable car, in the heart of the Sella Group. Each offers
          unique perspectives of jagged peaks, alpine meadows and landscapes.
        </p>
      </TourDescription>

      <TourCTA />
    </TourTemplate>
  );
}
