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
      name="DOLOMITES"
      title="DOLOMITES TOUR"
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

      <TourFeatures>
        <TourFeature
          title="UNESCO WORLD NATURAL HERITAGE SITE"
          description="The Dolomites are mountains of exceptional natural beauty. Their dramatic vertical and pale coloured peaks in a variety of distinctive sculptural forms is extraordinary in a global context. The Dolomites also features one of the best examples of the preservation of Mesozoic carbonate platform systems, with fossil records."
          image="/dolomites-unesco-heritage-dramatic-peaks.jpg"
        />
        <TourFeature
          title="CORTINA D'AMPEZZO"
          description="At 1.224m above sea level in the heart of the Dolomites, is located Cortina d'Ampezzo. The natural beauty of 'Queen of the Dolomites' is irresistible both to visitors looking to break the frenzy of today's way of living within the peaceful mountain environment and to those in search of superb sports facilities, both in winter and in summer."
          image="/cortina-dampezzo-town-dolomites-mountains.jpg"
        />
        <TourFeature
          title="LAKE MISURINA"
          description="The Misurina Lake, at 1754 m above sea level is one of the most beautiful lakes in Italy and the largest natural one in the Cadore area. It is embraced by some of the most noble mountain outlines in the Dolomites such as Tre Cime di Lavaredo, Cristallo and Marmarole. When you are here, it's like you're in a fairy tale!"
          image="/lake-misurina-dolomites-reflection-mountains.jpg"
        />
        <TourFeature
          title="LAGAZUOI CABLE CAR"
          description="Starting from Passo Falzarego, the Lagazuoi cable car rides up to 2.740 m (9,000 ft) above sea level, just below the summit of Mt Lagazuoi. Once on top, you will enjoy a breathtaking view in the heart of the Dolomites, an open-air Museum of World War 1, and the Lagazuoi EXPO Dolomiti exhibition."
          image="/lagazuoi-cable-car-mountain-view-dolomites.jpg"
        />
      </TourFeatures>

      <TourCTA />
    </TourTemplate>
  );
}
