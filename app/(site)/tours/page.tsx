import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/tours/collection-page";
import { SITE_URL } from "@/lib/constants";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";

/**
 * The catalog index: every day trip, with group and private a click away in
 * the navbar. Filter state lives in the URL so every combination is a real,
 * shareable, indexable page.
 */

export const metadata: Metadata = {
  title: "Day trips from Venice: the Dolomites & Prosecco Hills | Bea Vita Tours",
  description:
    "Small-group and private day tours from Venice and Jesolo — the Dolomites, Lake Braies, Cortina and the Prosecco hills. Book direct with the local operator.",
  alternates: { canonical: "/tours" },
  openGraph: {
    type: "website",
    title: "Day trips from Venice: the Dolomites & Prosecco Hills",
    description:
      "Small-group and private day tours from Venice and Jesolo — the Dolomites, Lake Braies, Cortina and the Prosecco hills.",
    url: `${SITE_URL}/tours`,
    siteName: "Bea Vita Tours",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ToursPage({ searchParams }: PageProps) {
  if (!isNativeBookingEnabled()) notFound();

  return (
    <CollectionPage
      style="all"
      heading="Day trips from Venice"
      intro="Leave the canals behind for a day. We drive you to the Dolomites, the shores of Lake Braies and the Prosecco hills — in a small group or entirely privately, always with a driver who knows the roads."
      title="Tours"
      href="/tours"
      searchParams={searchParams}
    />
  );
}
