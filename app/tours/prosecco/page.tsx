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
      image="/prosecco-vineyards-rolling-hills-italy.jpg"
      imageAlt="Prosecco Vineyards"
      ctaHeading="Ready to Experience Prosecco Country?"
      ctaName="Prosecco"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Just a 45 minute drive from Venice lies the region of Prosecco, UNESCO
          World Heritage Site.
        </p>
        <p className="leading-relaxed">
          On this tour we drive through the Prosecco Road that accommodates the
          finest vines and wineries where the highest quality Proseccos are
          produced. The landscape is without an end, villas on hills, hamlets,
          vineries...
        </p>
        <p className="leading-relaxed">
          In a Prosecco full day tour you can visit at least 3 wineries with
          sightseeing and time for a lunch stop in a family-run restaurant with
          excellent food and wine!
        </p>
        <p className="leading-relaxed">
          Pick-up and drop off of our tours are from Venice Piazzale Roma, the
          car terminal, to avoid any stress and waste of time to travel by train
          or by bus. Of course we can pick you up at any local hotel in the
          mainland.
        </p>
        <p className="leading-relaxed">
          We provide wine shipping service to all the countries with proper
          package to ensure that your shipment doesn't get damaged in transit.
        </p>
      </TourDescription>

      <TourFeatures>
        <TourFeature
          title="Molinetto della Croda"
          description="The Molinetto della Croda, an ancient mill, is a typical example of 17th century rural architecture with original foundations which are set into the rocky face of the mountain. Immersed in a charming natural landscape, it is open to the public as a working museum telling the story of the milling and the land."
          image="/ancient-mill-molinetto-della-croda-prosecco.jpg"
        />
        <TourFeature
          title="Prosecco Wine Tasting"
          description="There are over 100 wineries in the Prosecco DOCG area. For your wine tastings we select the best wineries amongst the most beautiful spots in the prosecco vineyards. You will learn about Prosecco production and will enjoy a guided wine tasting including at least 4 different types of Prosecco."
          image="/prosecco-wine-tasting-glasses-vineyard.jpg"
        />
        <TourFeature
          title="The Prosecco Road"
          description="The Prosecco Road goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
          image="/prosecco-road-scenic-drive-vineyards.jpg"
        />
        <TourFeature
          title="Shipping Wine"
          description="If you want to sample some great wines while on vacation but you don't have enough space left in your baggage it is our pleasure to ship anywhere in the world the wines purchased. We safely ship wine with a protection and a special shipping box to avoid any damage to the bottles."
          image="/wine-shipping-service-bottles-packaging.jpg"
        />
      </TourFeatures>

      <TourCTA />
    </TourTemplate>
  );
}
