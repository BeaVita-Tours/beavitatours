import type { Metadata } from "next";

import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import { TourCTA, TourDescription, TourTemplate } from "@/components/tour-template";

export const metadata: Metadata = {
  title: "Guided hiking and via ferrata in the Dolomites | Bea Vita Tours",
  description:
    "Lake Sorapis and via ferrata in the Dolomites with a qualified alpine guide. Private departures from Venice, transport and guiding included.",
  alternates: { canonical: "/tours/active-adventure" },
  openGraph: {
    type: "website",
    title: "Guided hiking and via ferrata in the Dolomites | Bea Vita Tours",
    description:
      "Lake Sorapis and via ferrata in the Dolomites with a qualified alpine guide. Private departures from Venice, transport and guiding included.",
    url: `${SITE_URL}/tours/active-adventure`,
    siteName: "Bea Vita Tours",
  },
};

export default function HikingTourPage() {
  return (
    <TourTemplate
      title="Active & Adventure"
      subtitle="To really get away, try an activity and adventure holiday!"
      image="/imgs/adventure.jpeg"
      imageAlt="Active & Adventure"
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

      {/* Every departure for this subject. Renders nothing while the flag is off. */}
      <ThemeUpsell theme="active-adventure" />

      <TourCTA heading="Ready to embrace the adventure?" />
    </TourTemplate>
  );
}
