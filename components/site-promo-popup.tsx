"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy, Ticket, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { useCookieConsent } from "@/components/cookie-consent-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { DIRECT_BOOKING_CODE, DIRECT_BOOKING_DISCOUNT } from "@/lib/promo";

/** Seen-at timestamp; the popup stays away for `SNOOZE_MS` after it. */
const STORAGE_KEY = "beavita_site_promo_v1";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
/** Long enough to be browsing, not arriving. */
const DELAY_MS = 25_000;

/**
 * Pages that never get it: the `/lp/*` landing pages run their own pair of
 * discount popups, and a guest on the confirmation page has already booked.
 */
const EXCLUDED = [/^\/lp\//, /^\/book\//, /^\/privacy/];

/**
 * The direct-booking discount, offered once across the main site (client,
 * 2026-09-29: "prevedere il pop up con la scontistica").
 *
 * Polite by construction: it waits for the cookie choice (never stacks on the
 * banner), opens only after 25 seconds on a page, and once seen it is gone for
 * two weeks. The `/lp/*` pages keep their own, more insistent pair.
 */
export function SitePromoPopup() {
  const pathname = usePathname();
  const { consent, hydrated, isSettingsOpen } = useCookieConsent();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const eligible =
    hydrated && consent !== null && !isSettingsOpen && !EXCLUDED.some((re) => re.test(pathname));

  useEffect(() => {
    if (!eligible || recentlySeen()) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible" || recentlySeen()) return;
      markSeen();
      setOpen(true);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eligible, pathname]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DIRECT_BOOKING_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard (insecure context): the code is on screen to type.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl outline-none duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="relative h-36 sm:h-44">
              <Image
                src="/tourprosecco.jpg"
                alt=""
                fill
                sizes="28rem"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35" />
              <span className="absolute bottom-4 left-4 text-3xl font-extrabold leading-none tracking-tight text-white drop-shadow-md sm:text-4xl">
                {DIRECT_BOOKING_DISCOUNT} OFF
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                Book direct and save {DIRECT_BOOKING_DISCOUNT}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Booking straight with our local team — no platforms in between? Here&apos;s{" "}
                {DIRECT_BOOKING_DISCOUNT} off your day trip, as our thank-you.
              </DialogDescription>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Discount code
                  </p>
                  <p className="truncate font-mono text-lg font-bold tracking-[0.15em] text-foreground sm:text-xl">
                    {DIRECT_BOOKING_CODE}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" onClick={copyCode}>
                  {copied ? (
                    <Check className="size-4 text-primary" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-muted-foreground">
                <Ticket className="size-3.5 shrink-0" aria-hidden="true" />
                Enter it under &ldquo;Redeem coupon code&rdquo; at checkout
              </p>

              <Button asChild className="mt-4 h-11 w-full text-base font-semibold">
                <Link href="/tours/group-tours" onClick={() => setOpen(false)}>
                  Find your day trip
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <DialogPrimitive.Close className="absolute top-3 right-3 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function recentlySeen(): boolean {
  try {
    const seenAt = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(seenAt) && Date.now() - seenAt < SNOOZE_MS;
  } catch {
    // Storage blocked: treat as seen rather than show it on every page.
    return true;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage blocked — `recentlySeen` already keeps the popup away.
  }
}
