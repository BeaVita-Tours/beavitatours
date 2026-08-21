import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroLogo from "@/public/logo-transparent-cropped.webp";

interface HeroPanelProps {
  image: string;
  alt: string;
  href: string;
  label: string;
}

/** One half of the split hero: a portrait full-bleed photo with a dark
    bottom overlay and a light, uppercase, letter-spaced CTA button. */
function HeroPanel({ image, alt, href, label }: HeroPanelProps) {
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
      {/* Bottom overlay — keeps the button legible over the photo */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-9 md:pb-12">
        <Button
          asChild
          className="h-auto rounded-md border border-white/70 bg-white/90 px-7 py-3 text-sm font-bold uppercase tracking-[0.22em] text-foreground shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:shadow-xl"
        >
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </div>
  );
}

/** Two-panel split hero: full-bleed photo panels with a logo masthead
    straddling the centre seam. Stacks vertically on mobile. */
export function HomeHero() {
  return (
    <section className="relative grid grid-cols-1 overflow-hidden md:grid-cols-2">
      {/* Masthead scrim: darkens just the top edge so the white logo reads
          over either photo — and over whatever photos are swapped in later. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-36 bg-linear-to-b from-black/65 to-transparent"
      />
      {/* Logo — centred on the seam, straddling both panels */}
      <Link
        href="/"
        aria-label="BeaVitaTours home"
        className="absolute left-1/2 top-5 z-20 -translate-x-1/2 md:top-7"
      >
        <Image
          src={heroLogo}
          alt="BeaVitaTours"
          width={480}
          height={96}
          priority
          className="h-28 w-auto md:h-30 drop-shadow-2xl drop-shadow-black/80 mt-8"
        />
      </Link>

      <HeroPanel
        image="/images/private-tours.jpg"
        alt="The Dolomites rising behind the Veneto plain"
        href="/rates"
        label="Private Tours"
      />
      <HeroPanel
        image="/images/shared-tours.jpg"
        alt="Vineyard hills of the Prosecco wine region"
        href="/tours/shared-tours"
        label="Shared Tours"
      />
    </section>
  );
}
