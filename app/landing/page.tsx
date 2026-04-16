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
  Star,
  Users,
  X,
} from "lucide-react";

const tourContent = {
  platformLabels: {
    getYourGuide: "GetYourGuide",
    viator: null,
  },
  urls: {
    booking:
      "https://www.getyourguide.com/it-it/comune-di-valdobbiadene-l153536/da-venezia-escursione-di-un-giorno-nelle-regioni-del-vino-amarone-e-prosecco-t852142/",
    viator:
     null,
  },
  hero: {
    badges: [
      { icon: Clock3, label: "5 hours" },
      { icon: Users, label: "Max 8 guests" },
      { icon: MapPin, label: "English" },
    ],
    title: "From Venice: 1-day trip to the Prosecco Hills and wine tasting",
    provider: "Activity provider: Bea Vita Tours",
    thumbnailLabel: "View slide",
    rating: {
      score: "5",
      reviews: "8 reviews",
    },
  },
  booking: {
    label: "Sells out often",
    originalPrice: "From 99 €",
    currentPrice: "79 €",
    unit: "per person",
    button: "Check availability",
    benefits: [
      {
        emphasis: "Free cancellation",
        text: "Cancel up to 24 hours before and receive a full refund",
      },
      {
        emphasis: "Book now, pay later",
        text: "Plan flexibly: reserve a spot without paying today",
      },
    ],
  },
  sections: {
    brief: "Activity in brief",
    included: "What’s included",
    itinerary: "Itinerary",
    description: "Full description",
    practical: "Quick facts",
    meetingPoint: "Meeting point",
    important: "Important",
    reviews: "Verified reviews",
  },
  cards: {
    included: "Included",
    notIncluded: "Not included",
  },
  briefItems: [
    "Explore the Prosecco Hills, a UNESCO World Heritage site",
    "For your convenience, the tour starts and ends in Venice",
    "Visit a family-run winery and learn how the wine is made",
    "Taste several varieties of the famous Prosecco sparkling wine",
    "Enjoy local delicacies: cheese, cured meats, and other tasty snacks",
  ],
  included: [
    "Pickup and return in central Venice",
    "Air-conditioned vehicle transfer",
    "Group coordinator",
    "Scenic drive through the Prosecco Hills",
    "Guided visit to a family-run winery",
    "Tasting of several wines, including Prosecco",
    "Food pairings with local cheese and cured meats",
  ],
  notIncluded: ["Hotel pickup and drop-off", "Tips"],
  itinerary: [
    {
      dot: "→",
      title: "Meeting point: Tronchetto",
      text: "Tronchetto, bus parking",
      time: "Meeting point",
    },
    {
      dot: "1",
      title: "Bus/coach transfer",
      text: "50 minutes",
      time: "50 min",
    },
    {
      dot: "2",
      title: "The Prosecco Hills",
      text: "Scenic drive, panoramic views along the route",
      time: "30 min",
    },
    {
      dot: "3",
      title: "The Prosecco Hills",
      text: "Wine tasting, guided visit, local snacks, culinary tasting, regional food",
      time: "2 hours",
    },
    {
      dot: "4",
      title: "The Prosecco Hills",
      text: "Free time, walk",
      time: "20 min",
    },
    {
      dot: "5",
      title: "Bus/coach transfer",
      text: "70 minutes",
      time: "70 min",
    },
    {
      dot: "⌂",
      title: "Return to:",
      text: "Tronchetto, bus parking",
      time: "Return",
    },
  ],
  description: [
    "Meet your guide in Venice, then reach the beautiful Prosecco Hills in less than an hour, a UNESCO World Heritage site.",
    "Away from the crowds of Venice, we travel along the Prosecco Road, among vineyards and charming villages.",
    "Skipping the most touristy wineries, you'll discover the secrets of a family-run vineyard known for its high-quality production. Learn how Italy's most famous sparkling wine is made and taste several types of Valdobbiadene Prosecco DOCG, among the best in quality. The tasting is accompanied by local delicacies such as cheese, cured meats, and other tasty snacks.",
    "You'll have the opportunity to stroll among the vineyards, admiring the hills with the most breathtaking views imaginable. The tour ends back at the meeting point in Venice in the early afternoon.",
    "If you'd like to enjoy excellent wines during your holiday but don't have enough room in your luggage, we're happy to ship the wines you purchase anywhere in the world. We ship the wine safely with protective packaging and a special box to help prevent bottle damage.",
  ],
  practicalInfo: [
    { label: "Duration", value: "5 hours" },
    { label: "Guide", value: "English" },
    { label: "Start and end", value: "Venice" },
  ],
  restrictions: {
    notSuitableLabel: "Not suitable for",
    notSuitable: ["Children under 10 years", "Wheelchair users"],
  },
  meetingPoint: {
    text: "The guide will meet you at Tronchetto, opposite the People Mover stop 'TRONCHETTO' and the water bus stop 'TRONCHETTO MERCATO' (line 2).",
    linkLabel: "Open in Google Maps",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Tronchetto%2C+Venice",
  },
  important: {
    notAllowedLabel: "Not allowed",
    notAllowed: ["Pets", "Food and drinks inside the vehicle"],
  },
  reviews: {
    summary: {
      score: "5",
      reviews: "8 reviews",
      badge: "Top-rated day trip from Venice",
      metrics: [
        { label: "Guide", value: "5.0" },
        { label: "Transport", value: "5.0" },
        { label: "Value", value: "5.0" },
      ],
    },
    items: [
      {
        name: "BeaVita Tours Client",
        meta: "United States · April 2026",
        text: "Lovely tour! Super cute vineyard and the drive up was wonderful as well!",
      },
      {
        name: "Charlotte",
        meta: "United Kingdom · April 2026",
        text: "We really enjoyed it",
      },
      {
        name: "Huma",
        meta: "United Kingdom · April 2026",
        text: "Absolutely amazing, Chiara was a very welcoming guide, informed us well and we visited the top prosecco cantina in the DOCG, the top quality region in Valdobbiodene! Our driver Enzo drove very smoothly and we felt so safe. Strongly recommending the trip to solo travellers like me!",
      },
      {
        name: "Kerle",
        meta: "Estona · April 2026",
        text: "The guide was very kind, attentive and easy to communicate with. Visiting a small family-run Prosecco winery made the experience feel authentic and special – it was so interesting to hear their story. The driver was also very friendly. Overall a lovely and memorable day",
      },
      {
        name: "BeaVita Tours Client",
        meta: "United States · April 2026",
        text: "Beautiful day we loved it!",
      },
      {
        name: "BeaVita Tours Client",
        meta: "Brazil · April 2026",
        text: "amazing!!!!!!!!",
      },
      {
        name: "Trinidad",
        meta: "Brazil · April 2026",
        text: "Wonderful!!! Only half a day, and you are completely in another world. Amazing hills, very funny tour guide. Best tour!",
      },
      {
        name: "Debbie",
        meta: "United States · April 2026",
        text: "🤩 Amazing!!! The bus is super comfortable, the guide inside super kind and funny, but the winery is OMG absolutely incredible! Wonderful experience in just half of a day.",
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
  ...Array.from({ length: 5 }, (_, i) => ({
    src: `/landing/tourpics/gyg${i + 1}.webp`,
    alt: "Prosecco hills",
  })),
];

const photoTiles = heroTiles.concat([
  ...Array.from({ length: 3 }, (_, i) => ({
    src: `/landing/tourpics/review${i + 1}.webp`,
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
    briefItems,
    included,
    notIncluded,
    itinerary,
    description,
    practicalInfo,
    restrictions,
    meetingPoint,
    important,
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
            {urls.viator ? (
              <Badge
                asChild
                className="rounded-full bg-[#1a5276] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white"
              >
                <a href={urls.viator} target="_blank" rel="noreferrer">
                  {platformLabels.viator}
                </a>
              </Badge>
            ) : null}
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
          <span className="text-[13px] text-[#7a6a52]">{hero.provider}</span>
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
            <div className="pb-0.5 text-[13px] text-white/70">
              {booking.unit}
            </div>
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
                  <strong className="text-white/95">{benefit.emphasis}</strong>{" "}
                  — {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.brief}
        </h2>
        <Card className="overflow-hidden border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <ul className="space-y-2 text-[13px] leading-6 text-[#3d3020]">
              {briefItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[#c9a84c]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
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
                        step.time === "Meeting point"
                          ? "border-[#1a1209] bg-[#1a1209] text-[#c9a84c]"
                          : step.time === "Return"
                            ? "border-[#c9a84c] bg-[#c9a84c] text-[#1a1209]"
                            : "border-[#c9a84c] bg-[#faf4e6] text-[#1a1209]",
                      ].join(" ")}
                    >
                      {step.time === "Meeting point" ? (
                        <ArrowRight className="size-3" />
                      ) : step.time === "Return" ? (
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
                    {step.time !== "Meeting point" && step.time !== "Return" ? (
                      <Badge className="mt-2 rounded-full bg-[#faf4e6] px-2 py-0.5 text-[10px] font-medium normal-case text-[#7a5c00]">
                        {step.time}
                      </Badge>
                    ) : step.time === "Meeting point" ? (
                      <Badge className="mt-2 rounded-full bg-[#faf4e6] px-2 py-0.5 text-[10px] font-medium normal-case text-[#7a5c00]">
                        Meeting point
                      </Badge>
                    ) : step.time === "Return" ? (
                      <Badge className="mt-2 rounded-full bg-[#faf4e6] px-2 py-0.5 text-[10px] font-medium normal-case text-[#7a5c00]">
                        Return
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
          <Card
            className="border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm"
          >
            <CardContent className="p-3 text-[13px] leading-6 text-[#3d3020]">
              <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7a6a52]">
                {restrictions.notSuitableLabel}
              </div>
              {restrictions.notSuitable.join(" · ")}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.meetingPoint}
        </h2>
        <Card className="border-[#c9a84c]/20 bg-white shadow-sm">
          <CardContent className="p-4 text-[14px] leading-7 text-[#3d3020]">
            <p>{meetingPoint.text}</p>
            <a
              href={meetingPoint.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 font-medium text-[#1a1209] underline underline-offset-4"
            >
              {meetingPoint.linkLabel}
              <ChevronRight className="size-4" />
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="px-4 py-5">
        <h2 className="mb-3 font-playfair-display text-[17px] font-semibold text-[#1a1209]">
          {sections.important}
        </h2>
        <Card className="border-[#c9a84c]/20 bg-[#faf4e6] shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[#7a6a52]">
              {important.notAllowedLabel}
            </div>
            <div className="space-y-2 text-[13px] leading-6 text-[#3d3020]">
              {important.notAllowed.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[#c0392b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
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
                        setReviewGalleryActiveIndex(
                          reviews.gallery.previewCount,
                        );
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
              key={review.name + Math.random().toString()}
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
            <div className="text-[14px] font-semibold">{footer.title}</div>
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
