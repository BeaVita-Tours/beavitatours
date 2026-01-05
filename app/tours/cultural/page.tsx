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
      name="GREAT WINES"
      title="GREAT WINES TOUR"
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

      <TourFeatures>
        <TourFeature
          title="AMARONE WINE TASTING"
          description="Valpolicella is one of Italy's most prestigious wine regions. No Italian wine is more distinctive than Amarone della Valpolicella, and few are as precious. That is due to the time, the labor and the materials required to craft every bottle. We personally select the wineries on our tours so we can guarantee about the quality."
          image="/amarone-wine-tasting-valpolicella-cellar.jpg"
        />
        <TourFeature
          title="PROSECCO WINE TASTING"
          description="There are over 100 wineries in the Prosecco DOCG area. For your wine tasting we will select one of the best wineries amongst the most beautiful spots in the prosecco vineyards. You wil learn about Prosecco production and will enjoy a guided wine tasting including at least 3 different types of Prosecco."
          image="/prosecco-wine-tasting-glasses-vineyard.jpg"
        />
        <TourFeature
          title="THE PROSECCO ROAD"
          description="The Strada del Prosecco goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
          image="/prosecco-road-scenic-drive-vineyards.jpg"
        />
        <TourFeature
          title="SHIPPING WINE"
          description="If you want to sample some great wines while on vacation but you don't have enough space left in your baggage it is our pleasure to ship anywhere in the world the wines purchased. We safely ship wine with a protection and a special shipping box to avoid any damage to the bottles."
          image="/wine-shipping-service-bottles-packaging.jpg"
        />
      </TourFeatures>

      <TourCTA />
    </TourTemplate>
  );
}
