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
  CardDescription,
  CardHeader,
  CardTitle,
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

const bookingUrl =
  "https://www.getyourguide.com/it-it/comune-di-valdobbiadene-l153536/da-venezia-escursione-di-un-giorno-nelle-regioni-del-vino-amarone-e-prosecco-t852142/";

const highlights = [
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
];

const included = [
  "Pickup and return from Piazzale Roma, Venice",
  "Comfortable air-conditioned transport",
  "Guide and group coordination",
  "Scenic drive through the Prosecco Hills",
  "Guided winery visit and tasting",
  "Four Valdobbiadene Prosecco DOCG wines",
  "Light lunch with local cheese and cured meats",
  "Aperol Spritz aperitivo with snacks",
  "Free time in Asolo",
];

const notIncluded = ["Hotel transfer", "Gratuities"];

const itinerary = [
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
];

const practicalInfo = [
  { label: "Meeting point", value: "Piazzale Roma, Venice" },
  { label: "Duration", value: "About 7 hours" },
  { label: "What to bring", value: "Comfortable shoes and a camera" },
  { label: "Minimum age", value: "14 years" },
];

const reviews = [
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
];

const photoTiles = [
  { src: "/landing/prosecco1.jpg", alt: "Prosecco hills" },
  { src: "/landing/prosecco2.jpg", alt: "Prosecco hills" },
  { src: "/landing/prosecco3.jpg", alt: "Prosecco hills" },
  { src: "/landing/prosecco4.jpg", alt: "Prosecco hills" },
];

const heroThumbnailCount = 3;
const reviewPreviewCount = 4;

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
              <a href={bookingUrl} target="_blank" rel="noreferrer">
                GetYourGuide
              </a>
            </Badge>
            <Badge
              asChild
              className="rounded-full bg-[#1a5276] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white"
            >
              <a
                href="https://www.viator.com/tours/Venice/From-Venice-Prosecco-Hills-tour-with-Wine-Spritz-and-Asolo/d522-5510234P6"
                target="_blank"
                rel="noreferrer"
              >
                Viator
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
            {photoTiles.map((slide, index) => (
              <CarouselItem key={slide.src} className="pl-0">
                <div className="relative h-[280px]">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#1a1209]/20 to-[#1a1209]/80" />
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {photoTiles.slice(1, 1 + heroThumbnailCount).map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className={`relative h-9 w-12 overflow-hidden rounded-md border transition-all ${
                heroIndex === index + 1
                  ? "border-[#c9a84c] ring-2 ring-[#c9a84c]/40"
                  : "border-white/60"
              }`}
              onClick={() => heroApi?.scrollTo(index + 1)}
              aria-label={`View slide ${index + 2}`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="48px"
                className="object-cover"
              />
            </button>
          ))}
          {photoTiles.length - 1 - heroThumbnailCount > 0 ? (
            <div className="flex h-9 w-12 items-center justify-center rounded-md border border-white/60 bg-[#1a1209] text-[11px] font-semibold text-[#c9a84c]">
              +{photoTiles.length - 1 - heroThumbnailCount}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="flex flex-wrap gap-2">
          <IconBadge icon={Clock3}>7 hours</IconBadge>
          <IconBadge icon={Users}>Max 8 guests</IconBadge>
          <IconBadge icon={MapPin}>English</IconBadge>
        </div>

        <h1 className="mt-4 text-[24px] font-semibold font-playfair-display leading-tight tracking-tight text-[#1a1209]">
          From Venice: Prosecco Hills wine day with Spritz and Asolo
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StarRow />
          <span className="text-[15px] font-semibold text-[#1a1209]">4.9</span>
          <span className="text-[13px] text-[#7a6a52]">· 394 reviews</span>
          <Badge className="rounded-full bg-[#faf4e6] px-2.5 py-1 text-[10px] font-medium normal-case text-[#7a5c00]">
            Top 20% day trips from Venice
          </Badge>
        </div>
      </section>

      <Card className="mx-4 mt-4 overflow-hidden border-[#c9a84c]/20 bg-[#1a1209] text-[#fffdf7] shadow-sm">
        <CardContent className="p-4">
          <div className="mb-3 inline-flex items-center rounded-full border border-[#ff8c42]/30 bg-[#ff8c42]/10 px-3 py-1 text-[11px] font-medium text-[#ff8c42]">
            Popular departure
          </div>

          <div className="mb-4 flex items-end gap-3">
            <div className="text-[14px] text-white/55 line-through">
              From 149 €
            </div>
            <div className="font-playfair-display text-[32px] font-bold leading-none text-[#c9a84c]">
              127 €
            </div>
            <div className="pb-0.5 text-[13px] text-white/70">/ person</div>
            <Badge className="ml-auto rounded-full bg-[#c9a84c] px-2.5 py-1 text-[11px] font-semibold normal-case text-[#1a1209]">
              −15%
            </Badge>
          </div>

          <Button
            asChild
            className="mb-3 w-full bg-[#c9a84c] text-[#1a1209] hover:bg-[#d5b960]"
          >
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              Check availability <ChevronRight className="size-4" />
            </a>
          </Button>

          <div className="space-y-2 text-[12px] leading-6 text-white/80">
            <div className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-[#c9a84c]" />
              <span>
                <strong className="text-white/95">Free cancellation</strong> —
                full refund up to 24 hours before
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-[#c9a84c]" />
              <span>
                <strong className="text-white/95">Book now, pay later</strong> —
                lock in your spot without paying today
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-[#c9a84c]" />
              <span>Instant confirmation · Mobile ticket</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          What the day includes
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
          What’s included
        </h2>
        <Card className="overflow-hidden border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#7a6a52]">
              Included
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
              Not included
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
          Tour itinerary
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
                        Timing confirmed at booking
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
          Full description
        </h2>
        <Card className="border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4 text-[14px] leading-7 text-[#3d3020]">
            <p>
              Start with pickup at Piazzale Roma, the big square in the centre
              of Venice. Travel in a comfortable van for less than an hour to
              the beautiful Prosecco Hills, a UNESCO World Heritage landscape.
            </p>
            <p className="mt-3">
              Explore Veneto’s best-known wine region with your guide. Visit a
              family-run winery where you’ll learn how Prosecco is made straight
              from the producers. Taste four different Valdobbiadene Prosecco
              DOCG wines with local cheese, cured meats, and classic snacks.
            </p>
            <p className="mt-3">
              Enjoy the classic Italian aperitivo — Aperol Spritz with snacks —
              at a panoramic stop among the vineyards. Then spend time in Asolo,
              the medieval hill town known as the “city of a hundred horizons,”
              with room to wander, shop, and take in the view.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          Practical information
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
              Not suitable for
            </div>
            Children under 14 years · Wheelchair users
          </CardContent>
        </Card>

        <Card className="mt-2 border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm">
          <CardContent className="p-3 text-[13px] leading-6 text-[#3d3020]">
            <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
              Good to know
            </div>
            The tour runs in light rain · Small group (max 8 guests)
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          Verified reviews
        </h2>
        <Card className="border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl bg-[#faf4e6] p-4 text-center">
                <div className="font-playfair-display text-[42px] leading-none text-[#1a1209]">
                  4.9
                </div>
                <StarRow className="mt-1 justify-center" />
                <div className="mt-2 text-[12px] text-[#7a6a52]">
                  394 reviews
                </div>
                <Badge className="mt-3 rounded-xl bg-white px-3 py-1 text-[11px] font-medium normal-case text-[#7a5c00]">
                  Top-rated day trip from Venice
                </Badge>

                <div className="mt-4 space-y-2 text-[11px] text-[#7a6a52]">
                  {[
                    { label: "Guide", value: "5.0" },
                    { label: "Transport", value: "5.0" },
                    { label: "Value", value: "5.0" },
                  ].map((row) => (
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
                    {photoTiles.slice(0, reviewPreviewCount).map((photo, index) => (
                      <button
                        key={photo.src}
                        type="button"
                        className="relative aspect-square overflow-hidden transition-transform active:scale-[0.98]"
                        onClick={() => {
                          setReviewGalleryIndex(index);
                          setReviewGalleryActiveIndex(index);
                          setReviewGalleryOpen(true);
                        }}
                        aria-label={`Open image ${index + 1}`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          sizes="33vw"
                          className="object-cover"
                        />
                      </button>
                    ))}
                    {photoTiles.length - reviewPreviewCount > 0 ? (
                      <button
                        type="button"
                        className="flex aspect-square items-center justify-center bg-[#1a1209] text-xl font-semibold text-[#c9a84c] transition-transform active:scale-[0.98]"
                        onClick={() => {
                          setReviewGalleryIndex(reviewPreviewCount);
                          setReviewGalleryActiveIndex(reviewPreviewCount);
                          setReviewGalleryOpen(true);
                        }}
                        aria-label="Open gallery"
                      >
                        +{photoTiles.length - reviewPreviewCount}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        <div className="mt-3 space-y-3">
          {reviews.map((review) => (
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
                {review.reply ? (
                  <div className="mt-3 rounded-xl border-l-2 border-[#c9a84c] bg-[#faf4e6] px-3 py-2 text-[12px] text-[#7a6a52]">
                    <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
                      Reply from Bea Vita Tours
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
          <DialogTitle className="sr-only">Review gallery</DialogTitle>
          <DialogDescription className="sr-only">
            Swipe through the photo gallery.
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
                          sizes="100vw"
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
              Ready to book
            </div>
            <div className="text-[14px] font-semibold">
              Jump straight to live dates
            </div>
          </div>
          <Button
            asChild
            className="bg-[#c9a84c] text-[#1a1209] hover:bg-[#d5b960]"
          >
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              Book now <ChevronRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
