import { createHash } from "node:crypto";
import type { Snapshot } from "../lib/seo/contract";
export const readToken = "read-test-" + "a".repeat(43);
export const previewReadToken = "preview-test-" + "a".repeat(43);
export const refreshSecret = "refresh-test-" + "b".repeat(43);
export const fixtureSite = "https://www.beavitatours.com";
export function sampleSnapshot(mode: "live" | "preview" = "live"): Snapshot {
  const content = {
    siteUrl: fixtureSite as typeof fixtureSite,
    articles: [
      {
        id: "test-guide",
        version: 1,
        title: "Planning a Dolomites day trip",
        slug: "planning-dolomites",
        language: "en" as const,
        summary:
          "Practical questions to ask before choosing a day trip from Venice.",
        body: "## Before your trip\n\nCheck the current itinerary with the tour operator. [Explore the tour](/en/tours/dolomites).\n\n<script>window.articleAttack = true</script>\n\n[Unsafe link](javascript:alert(1))\n\n![Unapproved image](https://untrusted.example/image.png)",
        metaTitle: "Plan a Dolomites trip | BeaVitaTours",
        metaDescription:
          "Questions to ask before booking your Dolomites day trip.",
        tourPath: "/en/tours/dolomites",
        publishedAt: "2026-09-19T12:00:00.000Z",
        canonical: `${fixtureSite}/en/guides/planning-dolomites`,
      },
    ],
    pages: [
      {
        path: "/en/about",
        version: 2,
        title: "About the tour team | BeaVitaTours",
        description: "Approved details about the Bea Vita Tours team.",
        canonical: `${fixtureSite}/en/about`,
        indexable: false,
        follow: true,
        alternates: [
          { language: "en" as const, path: "/en/about" },
          { language: "it" as const, path: "/it/about" },
        ],
      },
    ],
  };
  return {
    protocol: 1,
    mode,
    contentHash: createHash("sha256")
      .update(JSON.stringify(content))
      .digest("hex"),
    ...content,
  };
}
export function rehash(snapshot: Snapshot) {
  snapshot.contentHash = createHash("sha256")
    .update(
      JSON.stringify({
        siteUrl: snapshot.siteUrl,
        articles: snapshot.articles,
        pages: snapshot.pages,
      }),
    )
    .digest("hex");
  return snapshot;
}
