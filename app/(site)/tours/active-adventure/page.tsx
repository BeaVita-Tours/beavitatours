import type { Metadata } from "next";

import { ThemeClosingCTA } from "@/components/tours/theme-cta";
import { ThemeUpsell } from "@/components/tours/theme-upsell";
import { SITE_URL } from "@/lib/constants";
import {
  type GalleryImage,
  TourDescription,
  TourTagList,
  TourTemplate,
} from "@/components/tour-template";

const gallery: GalleryImage[] = [
  { src: "/hiking.jpg", alt: "Hikers on a trail in the Dolomites" },
  { src: "/mtb.webp", alt: "Mountain biking in the Veneto countryside" },
];

const activities = [
  "Dolomites",
  "hiking & trekking",
  "via ferrata",
  "cycling",
  "paragliding",
  "canyoning",
  "ziplining",
  "adventure parks",
  "and more",
] as const;

export const metadata: Metadata = {
  title: "Active & adventure day trips from Venice | beaVita Tours",
  description:
    "Hiking, via ferrata, cycling and more — a private day in the Dolomites or the Veneto countryside, planned around the activity you have in mind. Alpine guide included where it matters.",
  alternates: { canonical: "/tours/active-adventure" },
  openGraph: {
    type: "website",
    title: "Active & adventure day trips from Venice | beaVita Tours",
    description:
      "Hiking, via ferrata, cycling and more — a private day in the Dolomites or the Veneto countryside, planned around the activity you have in mind. Alpine guide included where it matters.",
    url: `${SITE_URL}/tours/active-adventure`,
    siteName: "beaVita Tours",
  },
};

/**
 * The two guided days, then the closing band. Both are private today, so the
 * band offers the private catalog and the contact page — it reads that from
 * the catalog, so a shared departure added here would change it.
 */
export default function ActiveAdventureTourPage() {
  return (
    <TourTemplate
      title="Active & Adventure"
      subtitle="Make your day as active as you like."
      image="/imgs/adventure.jpeg"
      imageAlt="Active & Adventure"
    >
      <TourDescription gallery={gallery}>
        <p className="leading-relaxed">
          From a day in the mountains to an experience built around a specific
          activity, we can help you plan it your way.
        </p>
        <p className="leading-relaxed">
          Whether you want to hike through the Dolomites, cycle through the
          countryside, try a via ferrata or simply add a little adventure to
          your day, tell us what you have in mind. We&apos;ll help you find the
          right place, route and experience.
        </p>
        <TourTagList label="Places and experiences you can explore" items={activities} />
      </TourDescription>

      <ThemeUpsell theme="active-adventure" />

      <ThemeClosingCTA
        page="active-adventure"
        privateCopy={{
          description:
            "Tell us what you'd like to do, and we'll help you turn it into a private day trip from Venice.",
          action: "Plan your private adventure",
        }}
      />
    </TourTemplate>
  );
}
