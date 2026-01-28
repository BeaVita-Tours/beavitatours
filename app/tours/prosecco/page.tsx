"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";
import { Wine } from "lucide-react";

export default function ProseccoTourPage() {
  return (
    <TourTemplate
      name="Prosecco"
      title="Prosecco Tour"
      subtitle="Explore the rolling hills and finest wineries of the Prosecco region"
      badge="UNESCO World Heritage Site"
      image="/tourprosecco.jpg"
      imageAlt="Prosecco Vineyards"
      ctaHeading="Ready to Experience Prosecco Country?"
      ctaName="Prosecco"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Just a 45 minute drive from Venice lies the region of Prosecco, UNESCO
          World Heritage Site. The landscape is characterised by hills, forests,
          small villages and farmland. For centuries, this rough terrain has
          been shaped and adapted by man.
        </p>
        <p className="leading-relaxed">
          Thanks to its special terracing system, soil and terrain conservation
          techniques and viticultural practices, this hilly area has become one
          of the most beautiful and productive wine-growing areas in the world.
          Prosecco is Italy's most famous sparkling wine. Thanks to its informal
          yet refined character, has created a new style of drink.
        </p>
        <p className="leading-relaxed">
          But the Prosecco Hills are not just wine: they are also culture of
          taste, authentic hospitality, art, landscape, memory. Castles,
          villages, mills and abbeys: in the area of the Prosecco hills there is
          truly something to see for everyone.
        </p>
      </TourDescription>

      <TourCTA />
    </TourTemplate>
  );
}
