/**
 * The two Regiondo tags the site browses by, and the product sets behind the
 * paid landing pages.
 *
 * Tag ids are stable account data (`GET /tags`), so they are pinned here rather
 * than looked up on every render — a collection page that silently empties
 * because a tag was renamed is worse than one that fails loudly.
 *
 * Not `server-only`: page components need these to build links.
 */

export const COLLECTIONS = {
  shared: {
    tagId: "45420",
    title: "Shared Tours from Venice",
    /** Existing URL — the page that hosts the Regiondo widget today. */
    href: "/tours/group-tours",
    heading: "Group day tours from Venice",
    intro:
      "Join a small group of no more than eight travellers. A comfortable minivan, a fluent English-speaking driver, and a full day in the mountains or the vineyards — leaving from Piazzale Roma.",
  },
  private: {
    tagId: "45421",
    title: "Private Tours from Venice",
    href: "/tours/private-tours",
    heading: "Private day tours from Venice",
    intro:
      "Your own vehicle, your own driver, your own pace. Private departures let you start when you like, linger where you want, and shape the day around what you actually came to see.",
  },
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

/**
 * Product sets for the paid landing pages.
 *
 * The `/lp/*` iframes filter Regiondo's whitelabel shop by the categories
 * `escape-venice-for-a-day` and `escape-from-jesolo-cavallino`. Those are
 * ticketshop categories — `GET /tags` does not know them, so there is no way to
 * reproduce the filter through the API. The sets are therefore pinned by
 * product id to match what each iframe shows today.
 *
 * If a tour is added to one of those shop categories, add its id here too.
 */
export const LANDING_PRODUCT_SETS = {
  "from-venice": [
    "298190", // Dolomites, Cortina and 2 lakes (shared)
    "300877", // Best of the Dolomites (shared)
    "341597", // Lake Braies and Tre Cime (shared)
    "326845", // Prosecco hills and wine tasting (shared)
    "307882", // Prosecco hills with wine, spritz and Asolo (shared)
    "298188", // Dolomites and Prosecco hills (private)
    "341599", // Medieval hill towns (private)
  ],
  "from-jesolo-cavallino": [
    "326843", // Dolomites day trip (private)
    "326844", // Prosecco hills (private)
  ],
} as const satisfies Record<string, readonly string[]>;

export type LandingKey = keyof typeof LANDING_PRODUCT_SETS;

/* -------------------------------------------------------------------------- */
/* theme pages                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Bookable tours for each hand-written theme page under `/tours/*`.
 *
 * Those five pages have always been editorial: they describe the Dolomites or
 * the Prosecco hills and then send the reader to `/rates`, with nothing
 * bookable in between. This maps each one to the departures that actually
 * deliver its subject, so the page can close.
 *
 * **Curated ids, not a keyword query.** The API's `kwd` search does work
 * (verified live: "dolomites" returns 8, "prosecco" 5, "wine" 6), but it
 * matches on descriptions, so it is approximate in both directions — a
 * keyword search for "dolomites" pulls in the Medieval Hill Towns tour because
 * its copy mentions them. On a conversion surface the ordering and the
 * membership are editorial judgements, so they are written down.
 *
 * Order is deliberate: shared, lower-priced departures first. They are the
 * easier yes, and someone who wants the private version will scroll.
 *
 * `browseHref` is where "see everything" goes. Themes whose curated set is
 * already the complete set link to the whole catalog rather than to a keyword
 * filter that could quietly return nothing later.
 */
export interface ThemeUpsell {
  /** Matches the directory under app/(site)/tours/. */
  readonly slug: string;
  readonly heading: string;
  readonly intro: string;
  readonly productIds: readonly string[];
  readonly browseHref: string;
  readonly browseLabel: string;
}

export const THEME_UPSELLS = {
  dolomites: {
    slug: "dolomites",
    heading: "Day trips to the Dolomites",
    intro:
      "Everything above is a two-hour drive away. These are the departures that take you there — leaving Venice in the morning and back the same evening.",
    productIds: ["300877", "298190", "341597", "298188", "339660", "341596", "326843"],
    browseHref: "/tours?q=dolomites",
    browseLabel: "See all Dolomites day trips",
  },
  prosecco: {
    slug: "prosecco",
    heading: "Day trips to the Prosecco hills",
    intro:
      "Forty-five minutes from Venice, and a different world. These departures take in the vineyards, a family-run winery and the hill towns between them.",
    productIds: ["326845", "307882", "298188", "326844"],
    browseHref: "/tours?q=prosecco",
    browseLabel: "See all Prosecco hills day trips",
  },
  "wine-food": {
    slug: "wine-food",
    heading: "Tours built around the table",
    intro:
      "Prosecco at the winery that made it, cicchetti, local cheese and salami, and a long lunch somewhere worth the drive.",
    productIds: ["326845", "307882", "341599", "298188", "326844"],
    browseHref: "/tours?q=wine",
    browseLabel: "See all wine and food tours",
  },
  "active-adventure": {
    slug: "active-adventure",
    heading: "Guided days in the mountains",
    intro:
      "Both of these go out with a qualified alpine guide, and both are private — the group is you and whoever you bring.",
    productIds: ["339660", "341596"],
    // The curated set is already every guided mountain departure we run, so
    // "see all" means the whole catalog rather than a narrower filter.
    browseHref: "/tours",
    browseLabel: "Browse every day trip",
  },
  cultural: {
    slug: "cultural",
    heading: "Tours through the hill towns",
    intro:
      "Asolo, Cison di Valmarino and the walled villages between them — medieval streets, a castle or two, and wine at the end of it.",
    productIds: ["307882", "341599"],
    browseHref: "/tours",
    browseLabel: "Browse every day trip",
  },
} as const satisfies Record<string, ThemeUpsell>;

export type ThemeKey = keyof typeof THEME_UPSELLS;

