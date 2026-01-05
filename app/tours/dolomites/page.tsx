"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";

export default function DolomitesTourPage() {
  return (
    <TourTemplate
      name="Dolomites"
      title="Dolomites Tour"
      subtitle="Experience the breathtaking beauty of the Queen of the Dolomites"
      badge="UNESCO World Heritage Site"
      image="/dolomites-mountains-unesco-world-heritage.jpg"
      imageAlt="Dolomites Mountains"
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
          In a day trip from Venice you can visit the 'Queen of the Dolomites'
          Cortina d'Ampezzo, one the most popular holiday destinations in the
          world, Lake Misurina, the 'Pearl of the Dolomites', from where you can
          enjoy a splendid view of the Tre Cime di Lavaredo, and you can take a
          ride on the Lagazuoi cable car with a breathtaking view in the heart
          of the Dolomites from 2.740 m (9,000 ft) above sea level.
        </p>
        <p className="leading-relaxed">
          Pick-up and drop off of our tours are from Venice Piazzale Roma, the
          car terminal. Of course we can pick you up at any local hotel in the
          mainland.
        </p>
      </TourDescription>

      <TourCTA />
    </TourTemplate>
  );
}
