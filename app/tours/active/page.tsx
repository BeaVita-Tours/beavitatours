"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";
import { TrendingUp } from "lucide-react";

export default function HikingTourPage() {
  return (
    <TourTemplate
      name="Active Tour"
      title="Active Tour"
      subtitle="Discover the Dolomites on foot with breathtaking trails and stunning vistas"
      badge="UNESCO World Heritage Site"
      image="/hiking2.jpg"
      imageAlt="Dolomites Hiking"
      ctaHeading="Ready for a Hiking Adventure?"
      ctaName="Active Tour"
    >
      <TourDescription>
        <p className="leading-relaxed">
          The Dolomites is a unique geological region in the Alps and an
          exciting hiking area.
        </p>
        <p className="leading-relaxed">
          The Dolomite Mountains feature an infinite number of trails winding
          their way through incredible landscapes, with breathtaking vistas
          adding to the drama. On our hiking itineraries, we take you to the
          famous landmarks framing Cortina d'Ampezzo, UNESCO World Heritage, on
          foot. Our hikes are quite easy and they are really doable for
          everyone.
        </p>
        <p className="leading-relaxed">
          Find below some examples of our most popular Dolomites hiking tours
          from Venice. We are available to organize any other itinerary of your
          interest.
        </p>
      </TourDescription>
      <TourCTA />
    </TourTemplate>
  );
}
