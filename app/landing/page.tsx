"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const regiondoScript =
  "https://widgets.regiondo.net/catalog/v1/catalog-widget.min.js";
const regiondoWidgetId = "7365a711-ca3c-4834-8686-e19642235ae2";

const highlights = [
  {
    icon: Sparkles,
    title: "A relaxed UNESCO route",
    text: "The day is built around the Prosecco Hills, with scenic stops and time to actually enjoy them.",
  },
  {
    icon: BadgeCheck,
    title: "Small-group feel",
    text: "A better pace, a better atmosphere, and more room for the guide to make it personal.",
  },
  {
    icon: ShieldCheck,
    title: "Simple, secure booking",
    text: "Live availability is handled through Regiondo, so the booking flow stays fast and reliable.",
  },
  {
    icon: Users,
    title: "Easy from Venice",
    text: "Designed for travellers staying in Venice who want one memorable day outside the city.",
  },
];

const included = [
  "Pickup and drop-off in Venice",
  "Transport in a comfortable air-conditioned vehicle",
  "Small-group guidance for the full day",
  "Wine tasting at a family-run winery",
  "Light local food and a relaxed aperitivo stop",
  "Free time in Asolo for a short wander",
];

const notIncluded = ["Hotel pickup", "Gratuities"];

const itinerary = [
  {
    time: "Start",
    title: "Meet in Venice",
    text: "Head out from Piazzale Roma and leave the city behind without any hassle.",
  },
  {
    time: "Stop 1",
    title: "Scenic Prosecco Hills drive",
    text: "A photo-friendly route through vineyards and quiet viewpoints.",
  },
  {
    time: "Stop 2",
    title: "Family winery visit",
    text: "Taste a selection of local wines and learn what makes this area special.",
  },
  {
    time: "Stop 3",
    title: "Aperitivo in the hills",
    text: "Pause for a proper Italian aperitivo with open views and no rush.",
  },
  {
    time: "Stop 4",
    title: "Asolo",
    text: "Finish with time in one of the Veneto’s prettiest hill towns.",
  },
];

const practicalInfo = [
  {
    label: "Duration",
    value: "About 7 hours",
  },
  {
    label: "Group size",
    value: "Small group",
  },
  {
    label: "Meeting point",
    value: "Piazzale Roma, Venice",
  },
  {
    label: "Good to know",
    value: "Comfortable shoes recommended",
  },
];

const reviews = [
  {
    name: "Michael",
    meta: "United States",
    text: "Beautiful day, beautifully paced. The winery stop was the highlight.",
  },
  {
    name: "Martin",
    meta: "United Kingdom",
    text: "Everything felt easy and well organised. A genuinely great day out.",
  },
  {
    name: "Amy",
    meta: "Australia",
    text: "Great guide, great scenery, and just the right amount of time in each stop.",
  },
];

export default function LandingPage() {
  useEffect(() => {
    if (document.querySelector(`script[src="${regiondoScript}"]`)) {
      return;
    }

    const script = document.createElement("script");
    script.src = regiondoScript;
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <main className="bg-[#fbf8f1] text-[#2b2014] pb-28">
      <section className="border-b border-[#e4d5ab] bg-[#1a1209] text-[#fbf8f1]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-transparent-cropped-inverted.webp"
              alt="BeaVitaTours"
              width={360}
              height={72}
              priority
              className="h-9 w-auto"
            />
            <span className="hidden text-sm text-[#e8d4a0] sm:inline">
              Venice day trips with a lighter touch
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#e8d4a0]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d4a0]/30 px-3 py-1">
              <Star className="size-3.5 fill-[#e8d4a0] text-[#e8d4a0]" />
              4.9 / 5
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d4a0]/30 px-3 py-1">
              <MapPin className="size-3.5" />
              Venice pickup
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8d4a0]/30 px-3 py-1">
              <Users className="size-3.5" />
              Small group
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7b5f2a]">
              <span className="rounded-full bg-[#f1e2b1] px-3 py-1">
                From Venice
              </span>
              <span className="rounded-full bg-white px-3 py-1 border border-[#e4d5ab]">
                Wine, views, and a real lunch stop
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-[#1a1209] sm:text-5xl">
                Prosecco Hills day trip with wine tasting and Asolo
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#5f4b31] sm:text-lg">
                A calm, well-paced day from Venice into the Prosecco Hills:
                scenic roads, a family winery, a proper local lunch stop, and
                time to wander Asolo before heading back.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-[#c9a84c] px-5 text-[#1a1209] hover:bg-[#d5b960]"
              >
                <a href="#booking">Check live availability</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[#c9a84c]/40 bg-transparent px-5 text-[#1a1209] hover:bg-[#f4ead0]"
              >
                <a href="#details">See what’s included</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                "Easy Venice pickup",
                "No crowded coach feel",
                "Live booking via Regiondo",
              ].map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e4d5ab] bg-white px-3 py-2 text-sm text-[#5f4b31]"
                >
                  <Check className="size-4 text-[#2d7a4f]" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Image
                src="/ota/getyourguide.svg"
                alt="GetYourGuide"
                width={120}
                height={28}
                className="h-6 w-auto opacity-85"
              />
              <Image
                src="/ota/viator.svg"
                alt="Viator"
                width={100}
                height={24}
                className="h-5 w-auto opacity-85"
              />
              <Image
                src="/ota/tripadvisor.svg"
                alt="Tripadvisor"
                width={120}
                height={28}
                className="h-6 w-auto opacity-85"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-4xl border border-[#e4d5ab] bg-white shadow-[0_24px_80px_rgba(26,18,9,0.12)]">
              <div className="relative aspect-4/5">
                <Image
                  src="/tourprosecco.jpg"
                  alt="Prosecco hills"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1a1209]/70 via-[#1a1209]/20 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-[#c9a84c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1209]">
                  Bestseller feel
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-[#1a1209]/70 p-4 text-[#fbf8f1] backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-[#e8d4a0]">
                    <Star className="size-4 fill-[#e8d4a0] text-[#e8d4a0]" />
                    4.9 / 5 from recent travellers
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/90">
                    The kind of day that feels effortless: good scenery, good
                    wine, and no rush.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6" id="details">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-[#e4d5ab] bg-white p-5 shadow-sm"
              >
                <Icon className="size-5 text-[#c9a84c]" />
                <h2 className="mt-4 text-base font-semibold text-[#1a1209]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5f4b31]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-4xl border border-[#e4d5ab] bg-[#1a1209] p-6 text-[#fbf8f1] shadow-[0_16px_50px_rgba(26,18,9,0.12)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#e8d4a0]">
              <Clock3 className="size-3.5" />
              Booking summary
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Simple, direct, and built for fast decisions
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              The page stays focused on one thing: getting people to a great day
              trip quickly, without clutter or detours.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Clear booking path",
                "No site navigation loop",
                "Mobile-first layout",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-[#8cd49c]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button
                asChild
                className="rounded-full bg-[#c9a84c] px-5 text-[#1a1209] hover:bg-[#d5b960]"
              >
                <a href="#booking">Go to live booking</a>
              </Button>
            </div>
          </div>

          <div className="rounded-4xl border border-[#e4d5ab] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1a1209]">
              What’s included
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5f2a]">
                  Included
                </p>
                <div className="mt-3 space-y-3">
                  {included.map((item) => (
                    <div
                      key={item}
                      className="flex gap-2 text-sm leading-6 text-[#4d3b25]"
                    >
                      <Check className="mt-1 size-4 flex-none text-[#2d7a4f]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5f2a]">
                  Not included
                </p>
                <div className="mt-3 space-y-3">
                  {notIncluded.map((item) => (
                    <div
                      key={item}
                      className="flex gap-2 text-sm leading-6 text-[#4d3b25]"
                    >
                      <span className="mt-1 flex size-4 flex-none items-center justify-center rounded-full bg-[#f6e3e3] text-[10px] font-bold text-[#c0392b]">
                        ×
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-4xl border border-[#e4d5ab] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1a1209]">
            The day, in order
          </h2>
          <div className="mt-6 space-y-4">
            {itinerary.map((item, index) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex w-16 flex-none flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1209] text-xs font-semibold text-[#e8d4a0]">
                    {index + 1}
                  </div>
                  {index < itinerary.length - 1 ? (
                    <div className="mt-2 h-full w-px flex-1 bg-[#eadbb1]" />
                  ) : null}
                </div>
                <div className="pb-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5f2a]">
                    {item.time}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#1a1209]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f4b31]">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-4xl border border-[#e4d5ab] bg-[#fbf4df] p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1a1209]">
              Practical details
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {practicalInfo.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#e8d7aa] bg-white p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5f2a]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#1a1209]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-[#e4d5ab] bg-white p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#1a1209]">
              Why people book this one
            </h2>
            <div className="mt-5 space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.name}
                  className="rounded-2xl border border-[#eadbb1] bg-[#fbf8f1] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1a1209]">
                        {review.name}
                      </div>
                      <div className="text-sm text-[#7b5f2a]">
                        {review.meta}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#c9a84c]">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4d3b25]">
                    {review.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="booking" className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-4xl border border-[#e4d5ab] bg-white p-6 shadow-sm">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1a1209]">
              Check live availability
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5f4b31]">
              The Regiondo widget below is the booking source of truth. It keeps
              the landing page fast while still letting travellers choose dates
              and book without friction.
            </p>
          </div>

          <div
            id="regiondo-widget"
            className="mt-6 min-h-[620px] overflow-hidden rounded-3xl border border-[#eadbb1] bg-[#fcfaf4] p-3 sm:p-4"
            dangerouslySetInnerHTML={{
              __html: `<product-catalog-widget widget-id="${regiondoWidgetId}"></product-catalog-widget>`,
            }}
          />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4d5ab] bg-[#fbf8f1]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#7b5f2a]">
              Ready to book
            </div>
            <div className="text-sm font-semibold text-[#1a1209]">
              Jump straight to live dates
            </div>
          </div>
          <Button
            asChild
            className="rounded-full bg-[#1a1209] px-5 text-[#fbf8f1] hover:bg-[#2b2014]"
          >
            <a href="#booking">
              Book now <ChevronRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
