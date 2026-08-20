"use client";

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { DirectBookingPopups } from "@/components/landing/direct-booking-popups";

interface EscapeLandingPageProps {
  heroTitle: string;
  heroSubtitle: string;
  widgetUrl: string;
}

const heroImage = "/landing/tourpics/gyg4.webp";

const trustBadges = [
  "⭐ 4.9 Tripadvisor (71 reviews)",
  "🏅 #22 of 293 in Venice",
  "✅ Licensed operator · Auth. 6297 TV",
  "🏠 Family-run",
  "🔄 Free cancellation",
];

const steps = [
  {
    icon: "📍",
    title: "Choose your tour",
    desc: "Dolomites, Prosecco hills, or a combo — departing from where you're staying",
  },
  {
    icon: "📞",
    title: "Book direct",
    desc: "No booking fees, no middlemen. You book straight with the local operator.",
  },
  {
    icon: "👋",
    title: "Meet your guide",
    desc: "Easy meeting point. Just look for the guide in the green jacket.",
  },
];

const whyBookProps = [
  {
    title: "Talk directly to the operator",
    desc: "Got questions about the meeting point, special requests, or the itinerary? You'll get answers straight from the person running the tour — before and during your trip.",
  },
  {
    title: "No booking fees, best price",
    desc: "No platform commissions added. What you see is exactly what you pay.",
  },
  {
    title: "Free cancellation up to 48h before",
    desc: "Plans change. Cancel free of charge up to 48 hours before your tour — full refund, no questions asked.",
  },
  {
    title: "Licensed, family-run local operator",
    desc: "Auth. 6297 prov. TV. We're a fully licensed tour operator based in the Veneto region — not a third-party reseller.",
  },
];

const faqItems = [
  {
    q: "Where do I meet my guide for pickup?",
    a: "Our shared day trips depart from a designated meeting point in Venice. For private tours, we can pick you up at your accommodation on the mainland or arrange a convenient meeting spot. You'll receive full details in your booking confirmation.",
  },
  {
    q: "How will I recognise my guide at the meeting point?",
    a: "Your guide will be at the meeting point 15 minutes before departure, wearing a bright green jacket and holding a Bea Vita Tours sign — easy to spot even in a busy square.",
  },
  {
    q: "Do you offer hotel pickup?",
    a: "For private tours we offer complimentary pickup from any hotel or address on the mainland. For shared tours, guests make their own way to the designated meeting point. If you're staying on the Venice island, a private water taxi can be arranged at an additional cost.",
  },
  {
    q: "What is your cancellation policy?",
    a: "You can cancel free of charge up to 48 hours before the tour starts. Cancellations must be sent by email or WhatsApp. After that window, the full rate applies.",
  },
  {
    q: "Are the tours suitable for children?",
    a: "Private tours are child-friendly. Children under 36 kg (79 lb) or 150 cm (4'9\") must use a proper car seat — we can provide baby seats and booster seats free of charge if you let us know a few days in advance. Shared tours have age restrictions, so please check when booking.",
  },
];

const ctaLabel = "Book your day trip now";

export function EscapeLandingPage({
  heroTitle,
  heroSubtitle,
  widgetUrl,
}: EscapeLandingPageProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const hasNavigatedRef = useRef(false);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    if (!hasNavigatedRef.current) {
      // First load — the user is on the landing page
      hasNavigatedRef.current = true;
    } else {
      // Subsequent load — the user clicked deeper into a tour page
      setShowBackButton(true);
    }
  };

  const goBackToMain = () => {
    setShowBackButton(false);
    hasNavigatedRef.current = false;
    setIframeLoaded(false);
    setIframeKey((k) => k + 1);
  };

  return (
    <>
      <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════
          SECTION 1: Hero
         ═══════════════════════════════════════════════ */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        {/* TODO: swap hero image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-bold leading-tight text-white md:text-5xl md:leading-tight">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-white/80 md:text-xl">
            {heroSubtitle}
          </p>
          <Button
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/80 text-base px-8 shadow-lg cursor-pointer"
            onClick={() => {
              document
                .getElementById("booking-widget")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {ctaLabel} <ArrowRight className="ml-1 size-4" />
          </Button>

          {/* Trust badges inside the hero overlay */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {trustBadges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className="rounded-full border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 shadow-sm backdrop-blur-md normal-case"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2: Booking Widget (Regiondo iframe)
         ═══════════════════════════════════════════════ */}
      <section id="booking-widget" className="bg-muted/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
              {ctaLabel}
            </h2>
            <Separator className="mx-auto mt-4 mb-8 w-16" />
            <div className="relative overflow-hidden">
              {showBackButton && (
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={goBackToMain}
                  >
                    <ArrowLeft className="size-4" />
                    Back to all tours
                  </Button>
                </div>
              )}
              {!iframeLoaded && (
                <div className="flex h-[800px] w-full flex-col items-center gap-4">
                  <Loader2 className="mt-16 size-12 animate-spin text-muted-foreground" />
                </div>
              )}
              <iframe
                key={iframeKey}
                src={"/api/regiondo-proxy?url=" + widgetUrl}
                title="Booking widget"
                width="100%"
                height="800"
                style={{ border: 0 }}
                allow="payment"
                loading="lazy"
                className={cn("w-full", !iframeLoaded && "h-0")}
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: How It Works — 3-step visual
         ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            How it works
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {step.icon}
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4: Why Book Direct
         ═══════════════════════════════════════════════ */}
      <section className="bg-primary/5 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              Why book direct
            </h2>
            <p className="mt-3 text-muted-foreground">
              No platforms, no markups — just a local family welcoming you to
              their backyard.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {whyBookProps.map((prop) => (
              <Card key={prop.title} className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Check className="size-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">
                    {prop.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {prop.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 shadow-lg"
              onClick={() => {
                document
                  .getElementById("booking-widget")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {ctaLabel} <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5: FAQ
         ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={`item-${index + 1}`}
                  value={`item-${index + 1}`}
                  className="rounded-xl border px-6 last:border-b"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      </main>
      <DirectBookingPopups />
    </>
  );
}
