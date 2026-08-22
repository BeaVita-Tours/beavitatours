import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  image: string;
  alt: string;
  /** Editable title / description / CTA copy for this brick. */
  content: HeroPanelContent;
  /** Bottom gradient scrim for text legibility. Toggle per brick — photos
      may change later and some may not need a scrim. Defaults to on. */
  gradient?: boolean;
}

/** One half of the split hero: a portrait full-bleed photo with a dark
    bottom overlay carrying the title, description, and CTA. */
function HeroPanel({ image, alt, content, gradient = true }: HeroPanelProps) {
  return (
    <div className="relative min-h-[62svh] md:min-h-[82svh]">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
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
    href: "/rates",
  },
  {
    title: "Group Tours",
    description:
      "Join fellow travelers on a fixed departure: easy to book, great value.",
    action: "Explore Group Tours",
    href: "/tours/group-tours",
  },
];

/** Two-panel split hero: full-bleed photo panels with title, description and
    CTA. Stacks vertically on mobile. */
export function HomeHero() {
  return (
    <section className="relative grid grid-cols-1 overflow-hidden md:grid-cols-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-linear-to-b from-black/65 to-transparent"
      />

      <HeroPanel
        image="/images/private-tours.jpg"
        alt="The Dolomites rising behind the Veneto plain"
        content={heroPanels[0]}
      />
      <HeroPanel
        image="/images/group-tours.jpg"
        alt="Vineyard hills of the Prosecco wine region"
        content={heroPanels[1]}
      />
    </section>
  );
}
