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
