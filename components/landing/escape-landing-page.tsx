"use client";

import { useTranslations } from "next-intl";
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

export type DepartureKey = "fromVenice" | "fromJesolo";

interface EscapeLandingPageProps {
  departureKey: DepartureKey;
}

const heroImages: Record<DepartureKey, string> = {
  fromVenice: "/landing/tourpics/gyg4.webp",
  fromJesolo: "/landing/tourpics/gyg4.webp",
};

const trustBadgeKeys = [
  "rating",
  "ranking",
  "licensed",
  "familyRun",
  "freeCancellation",
] as const;

const steps = [
  { icon: "step1Icon", title: "step1Title", desc: "step1Desc" },
  { icon: "step2Icon", title: "step2Title", desc: "step2Desc" },
  { icon: "step3Icon", title: "step3Title", desc: "step3Desc" },
] as const;

const whyBookProps = [
  { title: "prop1Title", desc: "prop1Desc" },
  { title: "prop2Title", desc: "prop2Desc" },
  { title: "prop3Title", desc: "prop3Desc" },
  { title: "prop4Title", desc: "prop4Desc" },
] as const;

const faqItems = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
  { q: "q4", a: "a4" },
  { q: "q5", a: "a5" },
] as const;

export function EscapeLandingPage({ departureKey }: EscapeLandingPageProps) {
  const t = useTranslations("landingPages");
  const shared = t.raw("shared") as Record<string, unknown>;
  const departure = t.raw(departureKey) as Record<string, string>;
  const trustBadges = (shared.trustBadges as Record<string, string>) ?? {};
  const howItWorks = (shared.howItWorks as Record<string, string>) ?? {};
  const whyBookDirect = (shared.whyBookDirect as Record<string, string>) ?? {};
  const faq = (shared.faq as Record<string, string>) ?? {};
  const widgetUrl = departure.widgetUrl ?? "";
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
    <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════
          SECTION 1: Hero
         ═══════════════════════════════════════════════ */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        {/* TODO: swap hero image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImages[departureKey]}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-bold leading-tight text-white md:text-5xl md:leading-tight">
            {departure.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-white/80 md:text-xl">
            {departure.heroSubtitle}
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
            {whyBookDirect.ctaLabel ?? "Book now"}{" "}
            <ArrowRight className="ml-1 size-4" />
          </Button>

          {/* Trust badges inside the hero overlay */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {trustBadgeKeys.map((key) => (
              <Badge
                key={key}
                variant="outline"
                className="rounded-full border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 shadow-sm backdrop-blur-md normal-case"
              >
                {trustBadges[key]}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: How It Works — 3-step visual
         ═══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
            {howItWorks.title}
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl">
                  {howItWorks[step.icon]}
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {howItWorks[step.title]}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {howItWorks[step.desc]}
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
              {whyBookDirect.title}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {whyBookDirect.subtitle}
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
                    {whyBookDirect[prop.title]}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {whyBookDirect[prop.desc]}
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
              {whyBookDirect.ctaLabel} <ArrowRight className="ml-1 size-4" />
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
              {faq.title}
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.q}
                  value={item.q}
                  className="rounded-xl border px-6 last:border-b"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium">{faq[item.q]}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq[item.a]}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6: Booking Widget (Regiondo iframe)
         ═══════════════════════════════════════════════ */}
      <section id="booking-widget" className="bg-muted/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
              {whyBookDirect.ctaLabel}
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
                    {(shared.backLabel as string) ?? "Back to all tours"}
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
    </main>
  );
}
