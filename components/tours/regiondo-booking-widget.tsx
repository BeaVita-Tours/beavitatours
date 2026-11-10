"use client";

import { useEffect, useRef, useState } from "react";

import { loadFallbackBooking, type FallbackBookingResult } from "@/app/(site)/tours/[slug]/actions";
import { BookingPanel } from "@/components/tours/booking-panel";
import { BookingSkeleton, NoDatesNotice, UnbookableNotice } from "@/components/tours/booking-notices";
import {
  BOOKING_WIDGET_HELLO,
  BOOKING_WIDGET_MESSAGE,
  type BookingWidgetMessage,
} from "@/lib/regiondo/booking-widget";
import type { TourPrice } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

/** Long enough for a slow phone connection; short enough that nobody waits on a dead widget. */
const LOAD_TIMEOUT_MS = 25_000;
/** Before the widget reports its height: about one calendar. */
const INITIAL_HEIGHT_PX = 620;
const MIN_HEIGHT_PX = 320;
const MAX_HEIGHT_PX = 4000;

interface RegiondoBookingWidgetProps {
  /** Same-origin embed URL, from `bookingWidgetEmbedHref`. */
  src: string;
  slug: string;
  title: string;
  priceFrom: TourPrice;
}

type Status = "loading" | "ready" | "failed";

/**
 * The tour page's booking box: Regiondo's hosted booking widget, framed.
 *
 * Only the booking box. The rest of the tour page is ours, as before. The
 * widget runs in a same-origin frame (see app/embed/regiondo-booking/route.ts
 * for why) that reports when it has rendered and how tall it is, so the box
 * grows with the widget's steps rather than scrolling inside itself.
 *
 * Fallback: if the widget reports a failure, or says nothing within
 * LOAD_TIMEOUT_MS, the frame is replaced by the API-driven booking panel this
 * page used before. That costs API requests only when it happens.
 */
export function RegiondoBookingWidget({ src, slug, title, priceFrom }: RegiondoBookingWidgetProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [height, setHeight] = useState<number>(INITIAL_HEIGHT_PX);

  useEffect(() => {
    setStatus("loading");

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as BookingWidgetMessage | null;
      if (!data || data.type !== BOOKING_WIDGET_MESSAGE) return;

      if (data.status === "height") {
        setHeight(Math.min(MAX_HEIGHT_PX, Math.max(MIN_HEIGHT_PX, Math.ceil(data.height))));
      } else if (data.status === "ready") {
        setStatus((current) => (current === "loading" ? "ready" : current));
      } else if (data.status === "failed") {
        console.warn(JSON.stringify({ at: "regiondo.widget.failed", reason: data.reason, title }));
        setStatus("failed");
      }
    }

    window.addEventListener("message", onMessage);
    // The frame may have settled before this page hydrated; ask again.
    sayHello();
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "failed" : current));
    }, LOAD_TIMEOUT_MS);

    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, [src, title]);

  function sayHello() {
    frameRef.current?.contentWindow?.postMessage(BOOKING_WIDGET_HELLO, window.location.origin);
  }

  if (status === "failed") return <ApiBookingFallback slug={slug} priceFrom={priceFrom} />;

  return (
    <div className="relative" data-booking-widget={status}>
      {status === "loading" ? (
        <div className="absolute inset-x-0 top-0 z-10 bg-card">
          <BookingSkeleton priceFrom={priceFrom} />
        </div>
      ) : null}
      <iframe
        ref={frameRef}
        src={src}
        title={`Book ${title}`}
        // Wallet payments inside Regiondo's checkout need the Payment Request API.
        allow="payment *"
        onLoad={sayHello}
        className={cn(
          "block w-full border-0 bg-transparent transition-opacity duration-300",
          status === "loading" ? "opacity-0" : "opacity-100"
        )}
        style={{ height }}
      />
    </div>
  );
}

/**
 * The API-driven panel, loaded on demand. Same panel, same data as a tour
 * with no widget gets from the server, just fetched after the fact.
 */
function ApiBookingFallback({ slug, priceFrom }: { slug: string; priceFrom: TourPrice }) {
  const [result, setResult] = useState<FallbackBookingResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadFallbackBooking(slug)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ kind: "error", message: "We cannot reach our booking system right now." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!result) return <BookingSkeleton priceFrom={priceFrom} />;

  switch (result.kind) {
    case "ready":
      return (
        <BookingPanel
          slug={result.slug}
          tour={result.tour}
          variations={result.variations}
          availability={result.availability}
          initialOptions={result.initialOptions}
          initialSeatsLeft={result.initialSeatsLeft}
          initialDate={result.initialDate}
          initialTime={result.initialTime}
          currency={result.currency}
          bookingNoticeHours={result.bookingNoticeHours}
        />
      );
    case "no-dates":
      return <NoDatesNotice priceFrom={result.priceFrom} />;
    case "unbookable":
      return <UnbookableNotice />;
    case "error":
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <a
            href="/contact"
            className="inline-flex text-sm font-medium text-primary-strong underline-offset-4 hover:underline"
          >
            Contact us to book
          </a>
        </div>
      );
  }
}
