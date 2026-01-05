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
      name="Dolomites Hiking"
      title="Dolomites Hiking Tour"
      subtitle="Discover the Dolomites on foot with breathtaking trails and stunning vistas"
      badge="UNESCO World Heritage Site"
      image="/hiking-trail-dolomites-mountains-lake.jpg"
      imageAlt="Dolomites Hiking"
      ctaHeading="Ready for a Hiking Adventure?"
      ctaName="Dolomites hiking"
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

      <TourFeatures title="Hiking Destinations">
        <TourFeature
          title="Rifugio Nuvolau"
          description="Built in 1883, the mountain hut Rifugio Nuvolau is the oldest refuge in the Dolomites. An authentic eagle's nest built on the summit of Mount Nuvolau (2575 metres high!), it has been renowned since the dawn of mountaineering for its breathtaking panorama."
          image="/rifugio-nuvolau-mountain-hut-dolomites.jpg"
        />
        <TourFeature
          title="Lake Sorapis"
          description="This walk is one of the most beautiful excursions in the Dolomites. In fact the lake is famous for its intense colour, in hues ranging from light blue to turquoise. The colour is created by the fine rock dust brought down from the like-named glacier whose spring and summer meltwater gives rise to the lake."
          image="/lake-sorapis-turquoise-water-dolomites.jpg"
        />
        <TourFeature
          title="Tre Cime di Lavaredo"
          description="The Tre Cime di Lavaredo is one of the Dolomite's iconic hikes. Three massive rocky prominences rise up from the rolling scenery of the Dolomites, surrounded by amazing views and wildflowers. While on the hike you'll encounter a series of refuges that you can pop into to grab something to eat or a beer along the hike!"
          image="/tre-cime-di-lavaredo-three-peaks-dolomites.jpg"
        />
        <TourFeature
          title="Cortina d'Ampezzo"
          description="All our hiking tours include a visit to Cortina d'Ampezzo, located in the heart of the Dolomites. The natural beauty of 'Queen of the Dolomites' is irresistible both to visitors looking to break the frenzy of today's way of living within the peaceful mountain environment and to those in search of superb sports facilities, both in winter and in summer."
          image="/cortina-dampezzo-town-dolomites-mountains.jpg"
        />
      </TourFeatures>

      <TourCTA />
    </TourTemplate>
  );
}
