import Link from "next/link";
import { type HeroSlide, HeroSlideshow } from "@/components/hero-slideshow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroPanelContent {
  /** Banner heading shown above the description. */
  title: string;
  /** One or two lines of supporting copy that explains the choice. */
  description: string;
  /** CTA button label. */
  action: string;
  /** Destination for the CTA. */
  href: string;
}

interface HeroPanelProps {
  /** The panel's photographs, the first one shown first. */
  slides: readonly HeroSlide[];
  /** Delay before this panel's first change, to stagger the two. */
  offset?: number;
  /** Editable title / description / CTA copy for this brick. */
  content: HeroPanelContent;
  /** Bottom gradient scrim for text legibility. Toggle per brick — photos
      may change later and some may not need a scrim. Defaults to on. */
  gradient?: boolean;
  /** Extra classes on the panel wrapper (used for responsive ordering). */
  className?: string;
}

/** One half of the split hero: full-bleed photos cross-fading behind a dark
    bottom overlay carrying the title, description, and CTA. */
function HeroPanel({ slides, offset, content, gradient = true, className }: HeroPanelProps) {
  return (
    <div className={cn("relative min-h-[62svh] md:min-h-[82svh]", className)}>
      <HeroSlideshow slides={slides} offset={offset} label={`${content.title} photos`} />
      {/* Bottom overlay — keeps the supporting copy and CTA legible over the
          photo. Conditional so a brick can opt out via `gradient={false}`. */}
      {gradient && (
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-9 text-center md:pb-12">
        <h2 className="text-3xl font-bold text-white drop-shadow-md md:text-4xl">
          {content.title}
        </h2>
        <p className="max-w-md text-balance text-base text-white/95 drop-shadow-sm md:text-lg">
          {content.description}
        </p>
        <Button
          asChild
          className="mt-2 h-auto rounded-md border border-white/70 bg-white/90 px-7 py-3 text-sm font-bold uppercase tracking-[0.22em] text-foreground shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:shadow-xl"
        >
          <Link href={content.href}>{content.action}</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Editable hero copy, one block per banner. Wording lives here rather than
 * inlined so marketing can tweak it in one place; swap this for a CMS fetch
 * if/when the hero moves to structured content.
 */
const heroPanels: HeroPanelContent[] = [
  {
    title: "Private Tours",
    description:
      "Just you and your guide: the route, the pace, everything tailored to your needs.",
    action: "Explore Private Tours",
    href: "/tours/private-tours",
  },
  {
    title: "Group Tours",
    description:
      "Join fellow travelers on a fixed departure: easy to book, great value.",
    action: "Explore Group Tours",
    href: "/tours/group-tours",
  },
];

/**
 * Three photos per panel (client, 2026-09-29). Private: the day as yours —
 * the view, a table set for two, the Prosecco poured. Group: real guests on
 * the road, at a winery terrace and under the Dolomites.
 *
 * Revision of 2026-10-26: the client's own list of proposed photos (a PDF of
 * stock images) is followed slide for slide, with free Pexels photos of the
 * same kind standing in for the stock ones; the guests on the terrace and the
 * group on the Dolomites are the company's own.
 */
const privateSlides: HeroSlide[] = [
  { src: "/images/hero/private-boat.webp", alt: "A couple in a small boat on a still lake below rock cliffs" },
  { src: "/images/hero/private-van.webp", alt: "A guest relaxing in the open door of a private minivan" },
  { src: "/landing/broll14.jpg", alt: "Guests with a glass of Prosecco at a private tasting in the hills" },
  { src: "/images/hero/private-car.webp", alt: "A couple sitting on their car in an open mountain landscape" },
  { src: "/images/hero/private-vineyard.webp", alt: "A smiling couple embracing in a vineyard" },
];

const groupSlides: HeroSlide[] = [
  { src: "/images/group-tours.webp", alt: "A beaVita group smiling on a Dolomites day trip" },
  { src: "/images/hero/group-coach.webp", alt: "A coach on a mountain road below rocky peaks" },
  { src: "/images/hero/group-friends-van.webp", alt: "A group of friends laughing beside a van on a day out" },
  { src: "/images/hero/group-toast.webp", alt: "Friends clinking glasses of white wine outdoors" },
  { src: "/images/hero/group-hikers.webp", alt: "A gravel path beside a turquoise mountain lake" },
];

/** Two-panel split hero: full-bleed photo panels with title, description and
    CTA. Stacks vertically on mobile, where Group Tours comes first (it is the
    volume product and the one a phone visitor is most likely after); on
    desktop the DOM order is kept — Private left, Group right. */
export function HomeHero() {
  return (
    <section className="relative grid grid-cols-1 overflow-hidden md:grid-cols-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-linear-to-b from-black/55 to-transparent"
      />

      <HeroPanel
        slides={privateSlides}
        content={heroPanels[0]}
        className="order-2 md:order-none"
      />
      <HeroPanel
        slides={groupSlides}
        offset={3000}
        content={heroPanels[1]}
        className="order-1 md:order-none"
      />
    </section>
  );
}
