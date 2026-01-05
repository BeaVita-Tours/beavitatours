"use client";

import {
  TourCTA,
  TourDescription,
  TourFeatures,
  TourTemplate,
} from "@/components/tour-template";
import { TourFeature } from "@/components/tour-feature";
import { Wine } from "lucide-react";

export default function GreatWinesTourPage() {
  return (
    <TourTemplate
      name="Great Wines"
      title="Great Wines Tour"
      subtitle="Discover Veneto's finest wines: Amarone and Prosecco in one unforgettable day"
      badge="Amarone & Prosecco"
      image="/wine-tasting-amarone-valpolicella.jpg"
      imageAlt="Great Wines Tour"
      ctaHeading="Ready to Taste Italy's Best Wines?"
      ctaName="Great Wines"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Veneto is italian biggest wine region in terms of quantity. Here wine
          is part of the popular culture and a glass of red or a glass of white
          will always be on the dining table.
        </p>
        <p className="leading-relaxed">
          There are no doubts about the most famous wines from Veneto: Prosecco
          and Amarone. Prosecco is one of the most popular wines in the world
          thanks to its breeziness and favourable price, while Amarone, produced
          in the surroundings of Verona, is an Italian excellence.
        </p>
        <p className="leading-relaxed">
          We drive through the Valpolicella valley and admire the scenic country
          roads with beautiful landscapes. Then we visit a winery, meet the
          winemaker and taste the Amarone, one of the most famous and best
          Italian wines recognized internationally for its elegance, complexity
          and great aging potential.
        </p>
        <p className="leading-relaxed">
          In the afternoon we drive through the Prosecco Road that accommodates
          the finest vines and wineries where the highest quality Proseccos are
          produced. Finally we end up in a selected winery to enjoy some
          excellent glasses of prosecco wine in a guided wine tasting.
        </p>
      </TourDescription>
      <TourCTA />
    </TourTemplate>
  );
}
