import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogView } from "@/components/tours/catalog-view";
import { TourGridSkeleton } from "@/components/tours/tour-grid";
import { SITE_URL } from "@/lib/constants";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

/**
 * The catalog index — the page that did not exist before.
 *
 * `/tours` had six hand-written children and no parent. This is now the
 * crawlable entry point to the whole catalog, with filter state in the URL so
 * every combination is a real, shareable, indexable page.
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
    <main className="container mx-auto px-4 py-12 md:py-16">
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Tours", href: "/tours" },
          ])
        )}
      />

      <header className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-4xl font-bold md:text-5xl">Day trips from Venice</h1>
        <p className="text-lg text-muted-foreground">
          Leave the canals behind for a day. We drive you to the Dolomites, the shores of Lake
          Braies and the Prosecco hills — in a small group or entirely privately, always with a
          driver who knows the roads.
        </p>
      </header>

      {/*
        The header above is static and paints immediately. The catalog itself
        depends on searchParams, so it streams in behind a skeleton sized to the
        grid it replaces — no layout shift when it lands.
      */}
      <Suspense fallback={<TourGridSkeleton />}>
        <CatalogView basePath="/tours" searchParams={searchParams} listName="All tours" />
      </Suspense>
    </main>
  );
}
