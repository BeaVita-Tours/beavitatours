"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";
import { Mountain } from "lucide-react";

export default function DolomitesProseccoTourPage() {
  return (
    <TourTemplate
      name="Dolomites and Prosecco"
      title="Wine & Food"
      subtitle="A journey through the finest wines and authentic flavors of the Veneto region."
      badge="Two UNESCO Sites in One Day"
      image="/tourwines.jpg"
      imageAlt="Dolomites and Prosecco"
      ctaHeading="Ready for the Ultimate Day Trip?"
      ctaName="Dolomites & Prosecco"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Italian cuisine, including its essential wine culture, is a UNESCO
          Heritage: a recognition of the art of Italian cooking as a social
          ritual of conviviality, shared practices, and deep connection to land
          and seasons, encompassing the entire food chain from cultivation to
          the table, with wine acting as a crucial bridge between traditions and
          generations.
        </p>
        <p className="leading-relaxed">
          Each region has its own specialities and offers food and wine tours to
          discover the varied and always tasty local cuisine. Veneto Region,
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
      <TourCTA />
    </TourTemplate>
  );
}
