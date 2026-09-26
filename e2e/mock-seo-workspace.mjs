#!/usr/bin/env node
/**
 * A stand-in for SEO Workspace's publication endpoint, for end-to-end tests.
 *
 * Serves the same snapshot as lib/seo/__tests__/fixture.ts — in the shape the
 * Workspace publishes today (www origin, /en/... paths) — so the tests cover
 * the mapping onto the English-only site. POST /__fixture switches the world
 * between page loads: reset, publish (edit the guide), withdraw (remove it),
 * fail and recover (answer 503, then normally again).
 *
 * Usage: node e2e/mock-seo-workspace.mjs [port]
 */
import { createHash } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 4011);
const readToken = "read-test-" + "a".repeat(43);
const site = "https://www.beavitatours.com";

function sampleSnapshot() {
  return rehash({
    protocol: 1,
    mode: "live",
    contentHash: "",
    siteUrl: site,
    articles: [
      {
        id: "test-guide",
        version: 1,
        title: "Planning a Dolomites day trip",
        slug: "planning-dolomites",
        language: "en",
        summary:
          "Practical questions to ask before choosing a day trip from Venice.",
        body: "## Before your trip\n\nCheck the current itinerary with the tour operator. [Explore the tour](/en/tours/dolomites).\n\n<script>window.articleAttack = true</script>\n\n[Unsafe link](javascript:alert(1))\n\n![Unapproved image](https://untrusted.example/image.png)",
        metaTitle: "Plan a Dolomites trip | BeaVitaTours",
        metaDescription:
          "Questions to ask before booking your Dolomites day trip.",
        tourPath: "/en/tours/dolomites",
        publishedAt: "2026-09-19T12:00:00.000Z",
        canonical: `${site}/blog/planning-dolomites`,
        blog: { author: { name: "The beaVita Team", bio: "Local people, shared stories." }, categories: [{ slug: "our-story", title: "Our Story" }], inlineImages: [] },
        modifiedAt: "2026-09-19T12:00:00.000Z",
        aliases: [`${site}/en/guides/planning-dolomites`],
        coverImage: {
          url: `${site}/imgs/dolomites/dolomitesmain.jpeg`,
          alt: "Rocky Dolomite peaks above the Lagazuoi cable-car station",
        },
      },
    ],
    pages: [
      {
        path: "/en/about",
        version: 2,
        title: "About the tour team | BeaVitaTours",
        description: "Approved details about the Bea Vita Tours team.",
        canonical: `${site}/en/about`,
        indexable: false,
        follow: true,
        alternates: [
          { language: "en", path: "/en/about" },
          { language: "it", path: "/it/about" },
        ],
      },
    ],
  });
}

// Same hash as the contract: over siteUrl, articles and pages, in that order.
function rehash(snapshot) {
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

let snapshot = sampleSnapshot();
let failed = false;

createServer(async (request, response) => {
  response.setHeader("content-type", "application/json");
  if (request.url === "/__fixture" && request.method === "POST") {
    let body = "";
    for await (const chunk of request) body += chunk;
    const { operation } = JSON.parse(body);
    if (operation === "reset") {
      snapshot = sampleSnapshot();
      failed = false;
    }
    if (operation === "withdraw") {
      snapshot.articles = [];
      rehash(snapshot);
    }
    if (operation === "publish") {
      snapshot.articles[0].title = "Updated published guide";
      snapshot.articles[0].version++;
      rehash(snapshot);
    }
    if (operation === "fail") failed = true;
    if (operation === "recover") failed = false;
    response.end(JSON.stringify({ ok: true }));
    return;
  }
  if (failed) {
    response.writeHead(503);
    response.end("{}");
    return;
  }
  if (request.url !== "/api/website/content") {
    response.writeHead(404);
    response.end("{}");
    return;
  }
  if (request.headers.authorization !== `Bearer ${readToken}`) {
    response.writeHead(401);
    response.end("{}");
    return;
  }
  response.end(JSON.stringify(snapshot));
}).listen(port, () => {
  console.log(`mock SEO Workspace on http://localhost:${port}`);
});
