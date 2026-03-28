"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Clock, MapPin, Mountain, Users, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

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
            {badge ? (
              <Badge className="mb-4 bg-accent text-accent-foreground border-0">
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
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto px-14">
          <Carousel opts={{ loop: true }}>
            <CarouselContent>
              {images.map((img) => (
                <CarouselItem key={img.src}>
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-[500px] object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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

import { useTranslations } from "next-intl";

export function TourFeatures({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("tours");
  
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">{title ?? t("highlights")}</h2>
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
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  const tTours = useTranslations("tours");
  
  const startingFromText = startingFrom
    ? ` ${tTours("startingFrom", { price: startingFrom })}`
    : "";

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{ctaHeading}</h2>
        <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
          {tTours("bookYourTour", { tourName: ctaName })}
          {startingFromText}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/rates">{tHome("viewRatesBook")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
          >
            <Link href="/">{tCommon("back")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
