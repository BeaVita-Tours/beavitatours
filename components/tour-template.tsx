"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type ExtraDetail = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type CarouselImage = {
  src: string;
  alt: string;
};

export type TourTemplateProps = {
  name: string;

  image: string;
  imageAlt: string;
  badge?: string;
  title?: string;
  subtitle?: string;

  /** Images shown in a gallery carousel below the hero. */
  carouselImages?: CarouselImage[];

  /** Used by TourCTA. Defaults are derived from `name`. */
  ctaHeading?: string;
  ctaName?: string;

  children: React.ReactNode;
};

type TourTemplateContextValue = {
  ctaHeading: string;
  ctaName: string;
  startingFrom?: string;
};

const TourTemplateContext =
  React.createContext<TourTemplateContextValue | null>(null);

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function useTourTemplateContext() {
  const ctx = React.useContext(TourTemplateContext);
  if (!ctx) {
    throw new Error("TourCTA must be used within <TourTemplate>.");
  }
  return ctx;
}

export function TourTemplate({
  name,
  image,
  imageAlt,
  badge,
  title,
  subtitle,
  carouselImages,
  ctaHeading,
  ctaName,
  children,
}: TourTemplateProps) {
  const fallbackName = toTitleCase(name);

  const effectiveCtaName = ctaName ?? fallbackName;
  const effectiveCtaHeading =
    ctaHeading ?? `Ready to Explore ${effectiveCtaName}?`;

  return (
    <TourTemplateContext.Provider
      value={{
        ctaHeading: effectiveCtaHeading,
        ctaName: effectiveCtaName,
      }}
    >
      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover object-[50%_70%]"
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
          </div>
          <div className="container mx-auto px-4 z-10 text-center">
            {/* The coral accent gave near-white text 3.16:1. Small uppercase
                text needs 4.5:1, so this badge uses the deeper teal too. */}
            {badge ? (
              <Badge className="mb-4 bg-primary-strong text-primary-foreground border-0">
                {badge}
              </Badge>
            ) : null}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title ?? `${name} TOUR`}
            </h1>
            {subtitle ? (
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {subtitle}
              </p>
            ) : null}
          </div>
        </section>

        {carouselImages && carouselImages.length > 0 && (
          <TourGallery images={carouselImages} />
        )}

        {children}
      </main>
    </TourTemplateContext.Provider>
  );
}

function TourGallery({ images }: { images: CarouselImage[] }) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section className="bg-muted/30 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <Carousel opts={{ loop: true }} setApi={setApi} className="relative">
            <CarouselContent className="-ml-3">
              {images.map((img) => (
                <CarouselItem
                  key={img.src}
                  className="pl-3 md:basis-4/5 lg:basis-2/3"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[16/9]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 70vw"
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/*
            The dot stays 10px; the button around it is 24px so it can actually
            be tapped. The visual is unchanged — only the hit area grew, which
            is what WCAG's minimum target size is about.
          */}
          <div className="mt-3 flex items-center justify-center">
            {images.map((img, index) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : undefined}
                className="flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => api?.scrollTo(index)}
              >
                <span
                  aria-hidden="true"
                  className={`block h-2.5 rounded-full transition-all ${
                    index === selectedIndex ? "w-6 bg-primary-strong" : "w-2.5 bg-border"
                  }`}
                />
              </button>
            ))}
          </div>
          {images.length > 1 ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Swipe to browse the gallery
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function TourDescription({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TourFeatures({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            {title ?? "Tour Highlights"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TourCTA() {
  const { ctaHeading, ctaName, startingFrom } = useTourTemplateContext();

  const startingFromText = startingFrom
    ? ` Starting from ${startingFrom} per group.`
    : "";

  return (
    /*
      --primary-strong rather than --primary: the lighter brand teal gives this
      band's near-white text 2.5:1, below AA. The deeper stop is 4.53:1 and is
      the same colour family. TourTemplate is used only by the five theme pages
      under /tours/*, so this changes nothing else on the site.
    */
    <section className="py-16 bg-primary-strong text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{ctaHeading}</h2>
        {/* Full opacity: at /90 this measured 2.3:1 even on the deeper teal. */}
        <p className="text-xl mb-8 text-primary-foreground max-w-2xl mx-auto">
          {`Book your ${ctaName} tour today.`}
          {startingFromText}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/rates">View Rates &amp; Book</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            <Link href="/">Back</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
