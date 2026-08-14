"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArrowRight, BadgePercent, Check, Copy, Ticket, X } from "lucide-react";

export const DIRECT_BOOKING_CODE = "BEAVITA10";

const PROMO_STORAGE_KEY = "beavita_direct_booking_promo_v1";
const SECOND_POPUP_MIN_DELAY_MS = 40_000;
const SECOND_POPUP_MAX_DELAY_MS = 60_000;
/**
 * Short grace period between dismissing popup #1 and showing popup #2 when
 * popup #2's timer already fired. Keeps the two dialogs from feeling stacked.
 */
const POPUP_HANDOFF_DELAY_MS = 1_200;

type PromoStage = "first" | "second" | "done";

interface PromoState {
  stage: PromoStage;
  /** When popup #1 was first shown in this session (ms epoch). */
  startedAt: number;
  /** Randomized delay for popup #2, kept stable across page navigations. */
  secondDelay: number;
}

/**
 * Popup #2 is scheduled 40-60s after arrival, so the timing varies between
 * visits and does not feel mechanical.
 */
function randomSecondDelay(): number {
  return (
    SECOND_POPUP_MIN_DELAY_MS +
    Math.random() * (SECOND_POPUP_MAX_DELAY_MS - SECOND_POPUP_MIN_DELAY_MS)
  );
}

function readPromoState(): PromoState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(PROMO_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<PromoState>;
    if (
      parsed &&
      (parsed.stage === "first" ||
        parsed.stage === "second" ||
        parsed.stage === "done") &&
      typeof parsed.startedAt === "number" &&
      typeof parsed.secondDelay === "number"
    ) {
      return parsed as PromoState;
    }
  } catch {
    // Corrupt or unavailable storage — treat as a fresh session.
  }
  return null;
}

function writePromoState(state: PromoState): void {
  try {
    window.sessionStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable — popups may simply show again on the next page.
  }
}

/**
 * Promotional dialogs for `/lp/*` landing pages.
 *
 * Popup #1 opens as soon as the page is interactive. Popup #2 opens after a
 * randomized 40-60s delay (only while the tab is visible) and, once shown,
 * the promo stays silent for the rest of the browsing session. The state is
 * kept in sessionStorage so navigating between landing pages never stacks
 * dialogs or re-triggers popups the user has already seen.
 */
export function DirectBookingPopups() {
  const t = useTranslations("directBookingPromo");

  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const stateRef = useRef<PromoState | null>(null);
  const firstOpenRef = useRef(false);
  const secondPendingRef = useRef(false);
  const copyResetTimerRef = useRef<number | null>(null);

  // Keep a ref in sync so timer callbacks always read the freshest value.
  useEffect(() => {
    firstOpenRef.current = firstOpen;
  }, [firstOpen]);

  // Session flow: popup #1 on entry, popup #2 after the randomized delay.
  useEffect(() => {
    const timerIds: number[] = [];
    let visibilityCleanup: (() => void) | null = null;

    const existing = readPromoState();
    const state: PromoState = existing ?? {
      stage: "first",
      startedAt: Date.now(),
      secondDelay: randomSecondDelay(),
    };
    stateRef.current = state;

    if (!existing) {
      writePromoState(state);
      // Popup #1 shows as soon as the page is interactive.
      setFirstOpen(true);
    }

    if (state.stage !== "done") {
      // Keep the 40-60s countdown anchored to the original arrival time, so
      // navigating between landing pages neither resets nor duplicates it.
      const elapsed = Date.now() - state.startedAt;
      const delay = Math.max(0, state.secondDelay - elapsed);

      const fireSecond = () => {
        // Only fire while the user is actually looking at the page.
        if (document.visibilityState !== "visible") {
          const onVisible = () => {
            visibilityCleanup = null;
            document.removeEventListener("visibilitychange", onVisible);
            fireSecond();
          };
          visibilityCleanup = () => {
            document.removeEventListener("visibilitychange", onVisible);
          };
          document.addEventListener("visibilitychange", onVisible);
          return;
        }
        // Never stack on top of popup #1: wait for it to be dismissed.
        if (firstOpenRef.current) {
          secondPendingRef.current = true;
          return;
        }
        setSecondOpen(true);
      };

      const timerId = window.setTimeout(fireSecond, delay);
      timerIds.push(timerId);
    }

    return () => {
      for (const id of timerIds) {
        window.clearTimeout(id);
      }
      visibilityCleanup?.();
    };
  }, []);

  // If popup #2's timer fired while popup #1 was still open, show it after a
  // short grace period once popup #1 has been dismissed.
  useEffect(() => {
    if (!firstOpen && secondPendingRef.current) {
      secondPendingRef.current = false;
      const timerId = window.setTimeout(
        () => setSecondOpen(true),
        POPUP_HANDOFF_DELAY_MS
      );
      return () => window.clearTimeout(timerId);
    }
  }, [firstOpen]);

  // Once popup #2 is on screen the promo is complete for this session.
  useEffect(() => {
    if (secondOpen && stateRef.current) {
      writePromoState({ ...stateRef.current, stage: "done" });
    }
  }, [secondOpen]);

  // Clean up the clipboard feedback timer on unmount.
  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const handleBookNow = () => {
    setFirstOpen(false);
    setSecondOpen(false);
    // Radix restores body scroll after the close animation.
    window.setTimeout(() => {
      document
        .getElementById("booking-widget")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DIRECT_BOOKING_CODE);
    } catch {
      // Clipboard API can be unavailable (e.g. non-secure context).
      try {
        const textArea = document.createElement("textarea");
        textArea.value = DIRECT_BOOKING_CODE;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        // Give up silently — the code is still visible to type manually.
      }
    }
    setCopied(true);
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ─── Popup #1: immediate, full-bleed hero image ─── */}
      <Dialog open={firstOpen} onOpenChange={setFirstOpen}>
        <DialogPortal>
          <DialogOverlay className="z-[60] bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-background outline-none",
              "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:block sm:h-auto sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:shadow-2xl",
              "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
          >
            <div className="relative flex w-full flex-1 flex-col overflow-y-auto sm:min-h-[30rem] sm:max-h-[calc(100dvh-2rem)]">
              <Image
                src="/imgs/dolomites/dolomitesmain.jpeg"
                alt=""
                fill
                priority
                sizes="(max-width: 640px) 100vw, 48rem"
                className="object-cover"
              />
              {/* Legibility overlays */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/25" />
              <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/60 to-transparent" />

              <div className="relative z-10 mt-auto flex w-full flex-col items-center p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:p-8 sm:pb-8">
                <Badge className="normal-case border-0 bg-accent px-3 py-1 text-xs font-bold tracking-wide text-accent-foreground">
                  <BadgePercent className="size-3.5" aria-hidden="true" />
                  {t("firstPopup.eyebrow")}
                </Badge>

                <p
                  aria-hidden="true"
                  className="mt-4 text-5xl font-extrabold leading-none tracking-tight text-white drop-shadow-md sm:text-6xl"
                >
                  {t("firstPopup.discount")}
                </p>

                <DialogTitle className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                  {t("firstPopup.title")}
                </DialogTitle>

                <DialogDescription className="mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                  {t("firstPopup.subtitle")}
                </DialogDescription>

                <div className="mt-5 flex flex-col items-center rounded-2xl border-2 border-dashed border-white/50 bg-white/10 px-6 py-3 backdrop-blur-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                    {t("firstPopup.codeLabel")}
                  </span>
                  <span className="mt-1 font-mono text-2xl font-bold tracking-[0.18em] text-white sm:text-3xl">
                    {t("code")}
                  </span>
                </div>

                <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-white/90">
                  <Ticket className="size-4 shrink-0" aria-hidden="true" />
                  {t("firstPopup.checkoutNote")}
                </p>

                <Button
                  size="lg"
                  className="mt-5 h-11 w-full bg-accent text-base font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 sm:w-auto sm:px-10"
                  onClick={handleBookNow}
                >
                  {t("firstPopup.cta")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <DialogPrimitive.Close className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
              <X className="size-5" />
              <span className="sr-only">{t("firstPopup.closeLabel")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* ─── Popup #2: delayed, card layout with header image ─── */}
      <Dialog open={secondOpen} onOpenChange={setSecondOpen}>
        <DialogPortal>
          <DialogOverlay className="z-[60] bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl outline-none",
              "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
            )}
          >
            <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
              {/* Header image strip */}
              <div className="relative h-36 sm:h-44">
                <Image
                  src="/imgs/dolomites/dolomites2.jpeg"
                  alt=""
                  fill
                  sizes="28rem"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <span className="text-3xl font-extrabold leading-none tracking-tight text-white drop-shadow-md sm:text-4xl">
                    {t("secondPopup.discount")}
                  </span>
                  <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-sm">
                    {t("secondPopup.eyebrow")}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                  {t("secondPopup.title")}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("secondPopup.subtitle")}
                </DialogDescription>

                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("secondPopup.codeLabel")}
                    </p>
                    <p className="truncate font-mono text-lg font-bold tracking-[0.15em] text-foreground sm:text-xl">
                      {t("code")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="size-4 text-primary" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                    {copied ? t("secondPopup.copied") : t("secondPopup.copy")}
                  </Button>
                </div>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-muted-foreground">
                  <Ticket className="size-3.5 shrink-0" aria-hidden="true" />
                  {t("secondPopup.checkoutNote")}
                </p>

                <Button
                  className="mt-4 h-11 w-full text-base font-semibold"
                  onClick={handleBookNow}
                >
                  {t("secondPopup.cta")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <DialogPrimitive.Close className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
              <X className="size-5" />
              <span className="sr-only">{t("secondPopup.closeLabel")}</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
