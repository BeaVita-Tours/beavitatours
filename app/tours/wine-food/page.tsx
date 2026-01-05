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
      title="Wine & Food Tour"
      subtitle="Dolomites & Prosecco Hills: Experience both UNESCO World Heritage sites in one unforgettable journey"
      badge="Two UNESCO Sites in One Day"
      image="/tourwines.jpg"
      imageAlt="Dolomites and Prosecco"
      ctaHeading="Ready for the Ultimate Day Trip?"
      ctaName="Dolomites & Prosecco"
    >
      <TourDescription>
        <p className="leading-relaxed">
          The Prosecco hills and the Dolomites mountains are the most popular
          destinations for a day tour in the region of Veneto, just outside the
          crowded Venice.
        </p>
        <p className="leading-relaxed">
          This tour offers the possibility to visit both these Unesco world
          heritage sites on the same day!
        </p>
        <p className="leading-relaxed">
          We drive through the ever-changing scenery of the mountains, spending
          some time in Cortina d'Ampezzo, the 'Queen of the Dolomites', and
          walking around the Lake Misurina, the 'Gem of the Dolomites', from
          where you can enjoy a splendid view of the Tre Cime di Lavaredo, the
          symbol of the Dolomites.
        </p>
        <p className="leading-relaxed">
          On the way back we drive through the Prosecco Road that accommodates
          the finest vines and wineries where the highest quality Proseccos are
          produced. Finally we end up in a selected winery to enjoy some
          excellent glasses of prosecco wine in a guided wine tasting.
        </p>
        <p className="leading-relaxed">
          Then you can relax on your journey back to Venice.
        </p>
      </TourDescription>
      <TourCTA />
    </TourTemplate>
  );
}
