"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { RegiondoWidget } from "@/components/landing/regiondo-widget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  Mountain,
  ShieldCheck,
  Star,
  Users,
  Wine,
  X,
} from "lucide-react";

const tourContent = {
  platformLabels: {
    getYourGuide: "GetYourGuide",
    viator: "Viator",
  },
  urls: {
    booking:
      "https://www.getyourguide.com/it-it/comune-di-valdobbiadene-l153536/da-venezia-escursione-di-un-giorno-nelle-regioni-del-vino-amarone-e-prosecco-t852142/",
    viator:
      "https://www.viator.com/tours/Venice/From-Venice-Prosecco-Hills-tour-with-Wine-Spritz-and-Asolo/d522-5510234P6",
  },
  hero: {
    badges: [
      { icon: Clock3, label: "7 hours" },
      { icon: Users, label: "Max 8 guests" },
      { icon: MapPin, label: "English" },
    ],
    title: "From Venice: Prosecco Hills wine day with Spritz and Asolo",
    thumbnailLabel: "View slide",
    rating: {
      score: "4.9",
      reviews: "394 reviews",
      badge: "Top 20% day trips from Venice",
    },
  },
  booking: {
    label: "Popular departure",
    originalPrice: "From 149 €",
    currentPrice: "127 €",
    unit: "/ person",
    discount: "−15%",
    button: "Check availability",
    benefits: [
      {
        emphasis: "Free cancellation",
        text: "full refund up to 24 hours before",
      },
      {
        emphasis: "Book now, pay later",
        text: "lock in your spot without paying today",
      },
      {
        text: "Instant confirmation · Mobile ticket",
      },
    ],
    confirmationBadge: "Timing confirmed at booking",
  },
  sections: {
    highlights: "What the day includes",
    included: "What’s included",
    itinerary: "Tour itinerary",
    description: "Full description",
    practical: "Practical information",
    reviews: "Verified reviews",
  },
  cards: {
    included: "Included",
    notIncluded: "Not included",
  },
  highlights: [
    {
      icon: Mountain,
      title: "UNESCO scenery",
      text: "Follow a scenic UNESCO route through the Prosecco Hills, with time to stop rather than rush past.",
    },
    {
      icon: Wine,
      title: "Family-run winery",
      text: "Taste local wines at a family-run winery and keep the atmosphere relaxed and personal.",
    },
    {
      icon: ShieldCheck,
      title: "Simple booking",
      text: "Book with confidence through live availability and a simple, mobile-friendly flow.",
    },
    {
      icon: Users,
      title: "Small-group feel",
      text: "Designed for small groups, with a pace that feels easy from Venice to Asolo.",
    },
  ],
  included: [
    "Pickup and return from Piazzale Roma, Venice",
    "Comfortable air-conditioned transport",
    "Guide and group coordination",
    "Scenic drive through the Prosecco Hills",
    "Guided winery visit and tasting",
    "Four Valdobbiadene Prosecco DOCG wines",
    "Light lunch with local cheese and cured meats",
    "Aperol Spritz aperitivo with snacks",
    "Free time in Asolo",
  ],
  notIncluded: ["Hotel transfer", "Gratuities"],
  itinerary: [
    {
      dot: "→",
      title: "Meeting point: Piazzale Roma",
      text: "Start in Venice and leave the city behind in comfort.",
      time: "Start",
    },
    {
      dot: "1",
      title: "Osteria Senz'Oste",
      text: "A scenic stop for photos and a first look over the hills.",
      time: "20 min",
    },
    {
      dot: "2",
      title: "Valdobbiadene",
      text: "Winery visit, tasting, and a proper taste of the region.",
      time: "1 h 45 min",
    },
    {
      dot: "3",
      title: "Prosecco Hills viewpoint",
      text: "Aperitivo with a view: Spritz, snacks, and a slow moment.",
      time: "20 min",
    },
    {
      dot: "4",
      title: "Asolo",
      text: "Time to wander one of Italy’s prettiest hill towns.",
      time: "1 h 30 min",
    },
    {
      dot: "⌂",
      title: "Return to Venice",
      text: "Head back to Piazzale Roma after an easy full day out.",
      time: "End",
    },
  ],
  description: [
    "Start with pickup at Piazzale Roma, the big square in the centre of Venice. Travel in a comfortable van for less than an hour to the beautiful Prosecco Hills, a UNESCO World Heritage landscape.",
    "Explore Veneto’s best-known wine region with your guide. Visit a family-run winery where you’ll learn how Prosecco is made straight from the producers. Taste four different Valdobbiadene Prosecco DOCG wines with local cheese, cured meats, and classic snacks.",
    "Enjoy the classic Italian aperitivo — Aperol Spritz with snacks — at a panoramic stop among the vineyards. Then spend time in Asolo, the medieval hill town known as the “city of a hundred horizons,” with room to wander, shop, and take in the view.",
  ],
  practicalInfo: [
    { label: "Meeting point", value: "Piazzale Roma, Venice" },
    { label: "Duration", value: "About 7 hours" },
    { label: "What to bring", value: "Comfortable shoes and a camera" },
    { label: "Minimum age", value: "14 years" },
  ],
  restrictions: {
    notSuitableLabel: "Not suitable for",
    notSuitable: "Children under 14 years · Wheelchair users",
    goodToKnowLabel: "Good to know",
    goodToKnow: "The tour runs in light rain · Small group (max 8 guests)",
  },
  reviews: {
    summary: {
      score: "4.9",
      reviews: "394 reviews",
      badge: "Top-rated day trip from Venice",
      metrics: [
        { label: "Guide", value: "5.0" },
        { label: "Transport", value: "5.0" },
        { label: "Value", value: "5.0" },
      ],
    },
    items: [
      {
        name: "Michael",
        meta: "United States · April 2026",
        text: "The van was comfortable, the guide was excellent, and the winery stop was the highlight.",
      },
      {
        name: "Martin",
        meta: "United Kingdom · April 2026",
        text: "Fabulous trip, well organised, great guide and host. Highly recommended.",
      },
      {
        name: "Amy M.",
        meta: "International · March 2026",
        text: "A brilliant day in the Prosecco hills. Great pace, great views, and great value.",
        reply:
          "Thank you so much — we’re glad the day felt special from the first stop to the last.",
      },
      {
        name: "Keith W.",
        meta: "International · February 2026",
        text: "The views were stunning and the small group made it feel almost private.",
      },
    ],
    replyLabel: "Reply from Bea Vita Tours",
    gallery: {
      title: "Review gallery",
      description: "Swipe through the photo gallery.",
      openImageLabel: "Open image",
      openGalleryLabel: "Open gallery",
      previewCount: 5,
    },
  },
  footer: {
    label: "Ready to book",
    title: "Jump straight to live dates",
    button: "Book now",
  },
  counts: {
    heroThumbnails: 3,
  },
} as const;

const heroTiles = [
  ...Array.from({ length: 4 }, (_, i) => ({
    src: `/landing/prosecco${i + 1}.jpg`,
    alt: "Prosecco hills",
  })),
];

const photoTiles = heroTiles.concat([
  ...Array.from({ length: 19 }, (_, i) => ({
    src: `/landing/broll${i + 1}.jpg`,
    alt: "Prosecco hills footage",
  })),
]);

function StarRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 text-[#c9a84c] ${className}`}>
      {[...Array(5)].map((_, index) => (
        <Star key={index} className="size-4 fill-current" />
      ))}
    </div>
  );
}

function IconBadge({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className="rounded-full border-[#c9a84c]/20 bg-white px-3 py-1 text-[11px] font-medium normal-case text-[#7a6a52] shadow-sm backdrop-blur-md"
    >
      <Icon className="size-3.5 text-[#c9a84c]" />
      {children}
    </Badge>
  );
}

export default function LandingPage() {
  const {
    platformLabels,
    urls,
    hero,
    booking,
    sections,
    cards,
    highlights,
    included,
    notIncluded,
    itinerary,
    description,
    practicalInfo,
    restrictions,
    reviews,
    footer,
    counts,
  } = tourContent;
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroAutoplay = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    }),
  );
  const [reviewGalleryOpen, setReviewGalleryOpen] = useState(false);
  const [reviewGalleryIndex, setReviewGalleryIndex] = useState(0);
  const [reviewGalleryApi, setReviewGalleryApi] = useState<CarouselApi | null>(
    null,
  );
  const [reviewGalleryActiveIndex, setReviewGalleryActiveIndex] = useState(0);

  useEffect(() => {
    if (!heroApi) {
      return;
    }

    const onSelect = () => {
      setHeroIndex(heroApi.selectedScrollSnap());
    };

    onSelect();
    heroApi.on("select", onSelect);
    heroApi.on("reInit", onSelect);

    return () => {
      heroApi.off("select", onSelect);
      heroApi.off("reInit", onSelect);
    };
  }, [heroApi]);

  useEffect(() => {
    if (!reviewGalleryApi) {
      return;
    }

    const onSelect = () => {
      setReviewGalleryActiveIndex(reviewGalleryApi.selectedScrollSnap());
    };

    onSelect();
    reviewGalleryApi.on("select", onSelect);
    reviewGalleryApi.on("reInit", onSelect);

    return () => {
      reviewGalleryApi.off("select", onSelect);
      reviewGalleryApi.off("reInit", onSelect);
    };
  }, [reviewGalleryApi]);

  return (
    <main className="mx-auto w-full max-w-[480px] bg-[#fffdf7] pb-24 font-dm-sans text-[#3d3020] antialiased">
      <header className="sticky top-0 z-50 border-b border-[#c9a84c]/20 bg-[#1a1209]/90 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Image
            src="/logo-transparent-cropped.webp"
            alt="Bea Vita Tours"
            width={150}
            height={30}
            priority
            className="h-9 w-auto"
          />
          <div className="flex items-center gap-2">
            <Badge
              asChild
              className="rounded-full bg-[#ff5533] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white"
            >
              <a href={urls.booking} target="_blank" rel="noreferrer">
                {platformLabels.getYourGuide}
              </a>
            </Badge>
            <Badge
              asChild
              className="rounded-full bg-[#1a5276] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white"
            >
              <a href={urls.viator} target="_blank" rel="noreferrer">
                {platformLabels.viator}
              </a>
            </Badge>
          </div>
        </div>
      </header>

      <section className="relative h-[280px] overflow-hidden">
        <Carousel
          opts={{ loop: true }}
          plugins={[heroAutoplay.current]}
          setApi={setHeroApi}
          className="h-full"
        >
          <CarouselContent className="ml-0 h-full">
            {heroTiles.map((slide, index) => (
              <CarouselItem key={slide.src} className="pl-0">
                <div className="relative h-[280px]">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 480px) 100vw, 480px"
                    quality={index === 0 ? 80 : 72}
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#1a1209]/20 to-[#1a1209]/80" />
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {heroTiles.slice(1, 1 + counts.heroThumbnails).map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className={`relative h-9 w-12 overflow-hidden rounded-md border transition-all ${
                heroIndex === index + 1
                  ? "border-[#c9a84c] ring-2 ring-[#c9a84c]/40"
                  : "border-white/60"
              }`}
              onClick={() => heroApi?.scrollTo(index + 1)}
              aria-label={`${hero.thumbnailLabel} ${index + 2}`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                loading="lazy"
                sizes="48px"
                quality={60}
                className="object-cover"
              />
            </button>
          ))}
          {heroTiles.length - 1 - counts.heroThumbnails > 0 ? (
            <div className="flex h-9 w-12 items-center justify-center rounded-md border border-white/60 bg-[#1a1209] text-[11px] font-semibold text-[#c9a84c]">
              +{heroTiles.length - 1 - counts.heroThumbnails}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="flex flex-wrap gap-2">
          {hero.badges.map((item) => {
            const Icon = item.icon;
            return (
              <IconBadge key={item.label} icon={Icon}>
                {item.label}
              </IconBadge>
            );
          })}
        </div>

        <h1 className="mt-4 text-[24px] font-semibold font-playfair-display leading-tight tracking-tight text-[#1a1209]">
          {hero.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StarRow />
          <span className="text-[15px] font-semibold text-[#1a1209]">
            {hero.rating.score}
          </span>
          <span className="text-[13px] text-[#7a6a52]">
            · {hero.rating.reviews}
          </span>
          <Badge className="rounded-full bg-[#faf4e6] px-2.5 py-1 text-[10px] font-medium normal-case text-[#7a5c00]">
            {hero.rating.badge}
          </Badge>
        </div>
      </section>

      <Card className="mx-4 mt-4 overflow-hidden border-[#c9a84c]/20 bg-[#1a1209] text-[#fffdf7] shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#ff8c42]/30 bg-[#ff8c42]/10 px-3 py-1 text-[11px] font-medium text-[#ff8c42]">
            {booking.label}
          </div>

          <div className="mb-4 flex items-end gap-3">
            <div className="text-[14px] text-white/55 line-through">
              {booking.originalPrice}
            </div>
            <div className="font-playfair-display text-[32px] font-bold leading-none text-[#c9a84c]">
              {booking.currentPrice}
            </div>
            <div className="pb-0.5 text-[13px] text-white/70">{booking.unit}</div>
            <Badge className="ml-auto rounded-full bg-[#c9a84c] px-2.5 py-1 text-[11px] font-semibold normal-case text-[#1a1209]">
              {booking.discount}
            </Badge>
          </div>

          <Button
            asChild
            className="mb-3 w-full bg-[#c9a84c] text-[#1a1209] hover:bg-[#d5b960]"
          >
            <a href={urls.booking} target="_blank" rel="noreferrer">
              {booking.button} <ChevronRight className="size-4" />
            </a>
          </Button>

          <div className="space-y-2 text-[12px] leading-6 text-white/80">
            {booking.benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-start gap-2">
                <Check className="mt-1 size-4 text-[#c9a84c]" />
                <span>
                  {"emphasis" in benefit ? (
                    <>
                      <strong className="text-white/95">{benefit.emphasis}</strong>{" "}
                      — {benefit.text}
                    </>
                  ) : (
                    benefit.text
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.highlights}
        </h2>
        <div className="grid gap-2">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm"
              >
                <CardContent className="flex items-start gap-3 px-3.5 py-2">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1209] shadow-sm">
                    <Icon className="size-4" />
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold text-[#1a1209]">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[13px] leading-5 text-[#3d3020]">
                      {item.text}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.included}
        </h2>
        <Card className="overflow-hidden border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#7a6a52]">
              {cards.included}
            </div>
            <div className="mt-3 space-y-2.5">
              {included.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-[#3d3020]"
                >
                  <Check className="mt-1 size-4 flex-none text-[#2d7a4f]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-[#c9a84c]/20" />
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#7a6a52]">
              {cards.notIncluded}
            </div>
            <div className="mt-3 space-y-2.5">
              {notIncluded.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-[#3d3020]"
                >
                  <X className="mt-1 size-4 flex-none text-[#c0392b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.itinerary}
        </h2>
        <Card className="overflow-hidden border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {itinerary.map((step, index) => (
                <div key={`${step.title}-${step.time}`} className="flex gap-3">
                  <div className="flex w-7 flex-none flex-col items-center">
                    <div
                      className={[
                        "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                        step.time === "Start"
                          ? "border-[#1a1209] bg-[#1a1209] text-[#c9a84c]"
                          : step.time === "End"
                            ? "border-[#c9a84c] bg-[#c9a84c] text-[#1a1209]"
                            : "border-[#c9a84c] bg-[#faf4e6] text-[#1a1209]",
                      ].join(" ")}
                    >
                      {step.time === "Start" ? (
                        <ArrowRight className="size-3" />
                      ) : step.time === "End" ? (
                        <Home className="size-3" />
                      ) : (
                        step.dot
                      )}
                    </div>
                    {index < itinerary.length - 1 ? (
                      <div className="mt-1 h-full w-px flex-1 bg-[#c9a84c]/20" />
                    ) : null}
                  </div>
                  <div className="pb-2">
                    <div className="text-[14px] font-medium text-[#1a1209]">
                      {step.title}
                    </div>
                    <div className="mt-0.5 text-[12px] leading-5 text-[#7a6a52]">
                      {step.text}
                    </div>
                    {step.time !== "Start" && step.time !== "End" ? (
                      <Badge className="mt-2 rounded-full bg-[#faf4e6] px-2 py-0.5 text-[10px] font-medium normal-case text-[#7a5c00]">
                        {step.time}
                      </Badge>
                    ) : step.time === "Start" ? (
                      <Badge className="mt-2 rounded-full bg-[#faf4e6] px-2 py-0.5 text-[10px] font-medium normal-case text-[#7a5c00]">
                        {booking.confirmationBadge}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.description}
        </h2>
        <Card className="border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4 text-[14px] leading-7 text-[#3d3020]">
            {description.map((paragraph, index) => (
              <p key={paragraph} className={index > 0 ? "mt-3" : undefined}>
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.practical}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {practicalInfo.map((item) => (
            <Card
              key={item.label}
              className="border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm"
            >
              <CardContent className="p-3">
                <div className="text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
                  {item.label}
                </div>
                <div className="mt-1 text-[13px] font-medium leading-5 text-[#1a1209]">
                  {item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-2 border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm">
          <CardContent className="p-3 text-[13px] leading-6 text-[#3d3020]">
            <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
              {restrictions.notSuitableLabel}
            </div>
            {restrictions.notSuitable}
          </CardContent>
        </Card>

        <Card className="mt-2 border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm">
          <CardContent className="p-3 text-[13px] leading-6 text-[#3d3020]">
            <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
              {restrictions.goodToKnowLabel}
            </div>
            {restrictions.goodToKnow}
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.reviews}
        </h2>
        <Card className="border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-[#faf4e6] p-4 text-center">
                <div className="font-playfair-display text-[42px] leading-none text-[#1a1209]">
                  {reviews.summary.score}
                </div>
                <StarRow className="mt-1 justify-center" />
                <div className="mt-2 text-[12px] text-[#7a6a52]">
                  {reviews.summary.reviews}
                </div>
                <Badge className="mt-3 rounded-xl bg-white px-3 py-1 text-[11px] font-medium normal-case text-[#7a5c00]">
                  {reviews.summary.badge}
                </Badge>

                <div className="mt-4 space-y-2 text-[11px] text-[#7a6a52]">
                  {reviews.summary.metrics.map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="w-16 text-left">{row.label}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-[#c9a84c]/20">
                        <div
                          className="h-1.5 rounded-full bg-[#c9a84c]"
                          style={{
                            width: row.value === "5.0" ? "100%" : "98%",
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-[#1a1209]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl bg-[#c9a84c]/15 p-1">
                <div className="grid grid-cols-3 gap-1">
                  {photoTiles
                    .slice(0, reviews.gallery.previewCount)
                    .map((photo, index) => (
                      <button
                        key={photo.src}
                        type="button"
                        className="relative aspect-square overflow-hidden transition-transform active:scale-[0.98]"
                        onClick={() => {
                          setReviewGalleryIndex(index);
                          setReviewGalleryActiveIndex(index);
                          setReviewGalleryOpen(true);
                        }}
                        aria-label={`${reviews.gallery.openImageLabel} ${index + 1}`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          loading="lazy"
                          sizes="(max-width: 480px) 33vw, 160px"
                          quality={66}
                          className="object-cover"
                        />
                      </button>
                    ))}
                    {photoTiles.length - reviews.gallery.previewCount > 0 ? (
                      <button
                        type="button"
                        className="flex aspect-square items-center justify-center bg-[#1a1209] text-xl font-semibold text-[#c9a84c] transition-transform active:scale-[0.98]"
                        onClick={() => {
                          setReviewGalleryIndex(reviews.gallery.previewCount);
                          setReviewGalleryActiveIndex(reviews.gallery.previewCount);
                          setReviewGalleryOpen(true);
                        }}
                        aria-label={reviews.gallery.openGalleryLabel}
                      >
                        +{photoTiles.length - reviews.gallery.previewCount}
                      </button>
                    ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-3 space-y-3">
          {reviews.items.map((review) => (
            <Card
              key={review.name}
              className="border-[#c9a84c]/20 bg-white shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#1a1209]">
                      {review.name}
                    </div>
                    <div className="text-[11px] text-[#7a6a52]">
                      {review.meta}
                    </div>
                  </div>
                  <StarRow />
                </div>
                <div className="mt-2 text-[13px] leading-6 text-[#3d3020]">
                  {review.text}
                </div>
                {"reply" in review ? (
                  <div className="mt-3 rounded-xl border-l-2 border-[#c9a84c] bg-[#faf4e6] px-3 py-2 text-[12px] text-[#7a6a52]">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
                      {reviews.replyLabel}
                    </div>
                    {review.reply}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={reviewGalleryOpen} onOpenChange={setReviewGalleryOpen}>
        <DialogContent className="h-dvh w-screen max-w-none overflow-hidden rounded-none border-0 bg-[#1a1209] p-0 text-white sm:h-[min(90vh,56rem)] sm:w-[min(92vw,80rem)] sm:rounded-2xl">
          <DialogTitle className="sr-only">{reviews.gallery.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {reviews.gallery.description}
          </DialogDescription>
          <div className="relative h-full w-full">
            <Carousel
              key={reviewGalleryIndex}
              opts={{ loop: true, startIndex: reviewGalleryIndex }}
              setApi={setReviewGalleryApi}
              className="h-full"
            >
              <CarouselContent className="ml-0 h-full">
                {photoTiles.map((photo) => (
                  <CarouselItem key={photo.src} className="pl-0">
                    <div className="relative h-dvh w-full sm:h-[min(90vh,56rem)]">
                      <div className="absolute inset-0 p-3 sm:p-6">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          loading="lazy"
                          sizes="(max-width: 480px) 100vw, 480px"
                          quality={78}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center">
              <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                {reviewGalleryActiveIndex + 1} / {photoTiles.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <section className="px-4 py-5" id="booking">
        <RegiondoWidget className="bg-[#fffdf7] rounded-md" />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#c9a84c]/20 bg-[#1a1209]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-3 px-4 py-3 text-[#fffdf7]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[#e8d4a0]">
              {footer.label}
            </div>
            <div className="text-[14px] font-semibold">
              {footer.title}
            </div>
          </div>
          <Button
            asChild
            className="bg-[#c9a84c] text-[#1a1209] hover:bg-[#d5b960]"
          >
            <a href={urls.booking} target="_blank" rel="noreferrer">
              {footer.button} <ChevronRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
