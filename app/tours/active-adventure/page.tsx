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
      name="Active & Adventure"
      title="Active & Adventure"
      subtitle="To really get away, try an activity and adventure holiday!s"
      image="/mtb.webp"
      imageAlt="Dolomites Adventure Trails"
      ctaHeading="Ready to Embrace the Adventure?"
      ctaName="Dolomites adventure"
    >
      <TourDescription>
        <p className="leading-relaxed">
          Ready for adrenaline and adventure? In the Veneto region there is
          something for every adventurer! Hiking, Trekking, Via Ferratas, Bike
          tours, Paragliding flights, Ziplines, Canyoning, helicopter panoramic
          rides, Adventure parks and much more!
        </p>
        <p className="leading-relaxed">
          For all the hiking and trekking lovers, Veneto is a match made in
          heaven. The trails and beautiful routes offer endless opportunities
          for exploration, despite the level of hiking experience. Via ferrata
          routes are marked trails for experienced hikers through particularly
          difficult and rocky areas, equipped with fixed ropes and ladders.
        </p>
        <p className="leading-relaxed">
          Veneto has also plenty of activities to offer also to children, from
          exciting roller coasters in top theme parks to bob sleigh rides
          through the foothills of the Dolomites. The region offers a broad
          selection of family activities the whole year round, that are fun for
          both kids and adults.
        </p>
      </TourDescription>
      <TourCTA />
    </TourTemplate>
  );
}
