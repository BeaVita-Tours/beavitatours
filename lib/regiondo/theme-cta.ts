import { COLLECTIONS, type CollectionKey } from "./collections";

/**
 * The closing band of a theme page, decided by how the theme can be booked.
 *
 * Pure: takes the set of collections the theme has departures in and returns
 * the heading and the two cards. The component (`components/tours/theme-cta.tsx`)
 * works the set out from the catalog and renders what this returns.
 *
 *   both     "Choose how you want to experience them." Group | Private
 *   private  "Have something specific in mind?"        Private | Talk to us
 *   shared   "Come along for the ride."                Group | Talk to us
 *
 * An empty set (catalog unreachable, or an untagged theme) is treated as both
 * — the only answer that is never wrong.
 */

export interface ChoiceOption {
  readonly title: string;
  readonly description: string;
  readonly action: string;
  readonly href: string;
}

export interface PrivateCopy {
  readonly description: string;
  readonly action: string;
}

export interface ClosingBand {
  readonly heading: string;
  readonly options: readonly [ChoiceOption, ChoiceOption];
}

/** The group card is the same everywhere, as it is on the homepage hero. */
const GROUP_CARD: ChoiceOption = {
  title: "Group Tours",
  description: "Join fellow travelers on a fixed departure — easy to book, great value.",
  action: "Explore group tours",
  href: COLLECTIONS.shared.href,
};

export const DEFAULT_PRIVATE_COPY: PrivateCopy = {
  description: "Just you and your guide: the route, the pace, everything tailored to your needs.",
  action: "Explore private tours",
};

function privateCard(copy: PrivateCopy): ChoiceOption {
  return { title: "Private Tours", href: COLLECTIONS.private.href, ...copy };
}

function talkToUs(description: string): ChoiceOption {
  return { title: "Talk to us", description, action: "Talk to us", href: "/contact" };
}

export function closingBandFor(
  styles: ReadonlySet<CollectionKey>,
  privateCopy: PrivateCopy = DEFAULT_PRIVATE_COPY
): ClosingBand {
  const shared = styles.has("shared");
  const priv = styles.has("private");

  if (priv && !shared) {
    return {
      heading: "Have something specific in mind?",
      options: [
        privateCard(privateCopy),
        talkToUs("Not sure where to start? Write to us and we'll take it from there."),
      ],
    };
  }

  if (shared && !priv) {
    return {
      heading: "Come along for the ride.",
      options: [
        GROUP_CARD,
        talkToUs(
          "Prefer the day to yourselves? Tell us what you have in mind and we'll build a private version."
        ),
      ],
    };
  }

  return {
    heading: "Choose how you want to experience them.",
    options: [GROUP_CARD, privateCard(privateCopy)],
  };
}
