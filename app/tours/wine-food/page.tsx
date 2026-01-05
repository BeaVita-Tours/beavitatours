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
      name="DOLOMITES AND PROSECCO"
      title="DOLOMITES AND PROSECCO"
      subtitle="Experience both UNESCO World Heritage sites in one unforgettable journey"
      badge="Two UNESCO Sites in One Day"
      image="/italian-countryside-mountains-and-vineyards.jpg"
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
          walking around the Lake Misurina, the 'Pearl of the Dolomites', from
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

      <TourFeatures>
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
          title="THE PROSECCO ROAD"
          description="The Strada del Prosecco goes between hills covered with vineyards and decorated by charming towns, abbeys, churches, castles and ancient inns. You will admire some of the loveliest views of the Prosecco Superiore Docg region and landscapes of extraordinary beauty within a vast natural theatre."
          image="/prosecco-road-scenic-drive-vineyards.jpg"
        />
        <TourFeature
          title="PROSECCO WINE TASTING"
          description="There are over 100 wineries in the Prosecco DOCG area. For your wine tasting we will select one of the best wineries amongst the most beautiful spots in the prosecco vineyards. You wil learn about Prosecco production and will enjoy a guided wine tasting including at least 3 different types of Prosecco."
          image="/prosecco-wine-tasting-glasses-vineyard.jpg"
        />
      </TourFeatures>

      <TourCTA />
    </TourTemplate>
  );
}
