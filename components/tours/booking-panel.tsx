"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, ArrowRight, CalendarDays, Clock, Loader2, Minus, Plus, ShieldCheck, Users } from "lucide-react";

import { startBooking } from "@/app/(site)/book/actions";
import { IDLE } from "@/lib/regiondo/action-state";
import { loadSlotOptions } from "@/app/(site)/tours/[slug]/actions";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, PriceDisplay } from "@/components/tours/price-display";
import { trackBeginCheckout, trackPaymentHandoff } from "@/lib/analytics";
import type { TourOption, TourVariation } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

/**
 * The calendar is the heaviest dependency on a tour page, so it loads after
 * the static shell rather than in the initial bundle. `ssr: false` because it
 * has nothing to contribute to that shell — and its "today" depends on the
 * visitor's clock, which the server does not have.
 */
const AvailabilityCalendar = dynamic(
  () => import("@/components/tours/availability-calendar").then((m) => m.AvailabilityCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[21rem] w-full rounded-2xl" />,
  }
);

interface BookingPanelProps {
  slug: string;
  /** For the ecommerce events. */
  tour: { id: string; title: string; category?: string };
  variations: readonly TourVariation[];
  /** date -> times, fetched live on the server for the initial window. */
  availability: Readonly<Record<string, readonly string[]>>;
  /** Options for the first available slot, so the panel opens with a price. */
  initialOptions: readonly TourOption[];
  initialDate: string | null;
  initialTime: string | null;
  currency: string;
  /** Hours of lead time the supplier needs, from the product. */
  bookingNoticeHours: number;
}

/**
 * The booking panel: date, time, option, party size — then one button that
 * holds the places and sends the customer to Regiondo's checkout, where they
 * enter their details and pay. Nothing is asked here that Regiondo asks again
 * (D-019).
 *
 * The handoff is done from the client, not by a server redirect: the action
 * returns the checkout URL, the panel fires the payment-handoff event, then
 * navigates. A redirect from the action would leave the page before the
 * event could be sent.
 */
export function BookingPanel({
  slug,
  tour,
  variations,
  availability,
  initialOptions,
  initialDate,
  initialTime,
  currency,
  bookingNoticeHours,
}: BookingPanelProps) {
  const [variationId, setVariationId] = useState(variations[0]?.id ?? "");
  const [date, setDate] = useState<string | null>(initialDate);
  const [time, setTime] = useState<string | null>(initialTime);
  const [options, setOptions] = useState<readonly TourOption[]>(initialOptions);
  const [optionId, setOptionId] = useState(initialOptions[0]?.id ?? "");
  const [qty, setQty] = useState(() => Math.max(1, initialOptions[0]?.minPerOrder ?? 1));
  const [slotError, setSlotError] = useState<string | null>(null);
  const [loadingSlot, startSlotLoad] = useTransition();
  const [handingOff, setHandingOff] = useState(false);

  const [state, formAction, submitting] = useActionState(startBooking, IDLE);
  const { hasAnalyticsConsent } = useCookieConsent();

  const option = options.find((candidate) => candidate.id === optionId) ?? options[0];
  const times = date ? (availability[date] ?? []) : [];
  const total = option ? option.price.amount * qty : 0;

  const minDate = useMemo(() => {
    const earliest = new Date();
    earliest.setHours(earliest.getHours() + bookingNoticeHours);
    return earliest;
  }, [bookingNoticeHours]);

  // Clamp the quantity whenever the option changes: a group option may require
  // a minimum, and seats left may be lower than what was selected on the
  // previous date.
  useEffect(() => {
    if (!option) return;
    setQty((current) => clampQty(current, option));
  }, [option]);

  // The hold is placed; off to Regiondo.
  useEffect(() => {
    if (state.status !== "handoff") return;
    setHandingOff(true);
    trackPaymentHandoff(
      { currency, value: total, items: [analyticsItem(tour, option, qty)] },
      hasAnalyticsConsent
    );
    navigateViaLink(state.checkoutUrl);
    // Fire once per handoff state, not on every consent or price tick.
    // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate — see above
  }, [state]);

  function selectDate(next: string) {
    setDate(next);
    setSlotError(null);

    const nextTime = availability[next]?.[0] ?? null;
    setTime(nextTime);
    if (!nextTime) return;

    // Seat counts move while the page is open, so options are refetched for
    // the chosen slot rather than reused from the initial render.
    startSlotLoad(async () => {
      const result = await loadSlotOptions({ variationId, date: next, time: nextTime });
      setOptions(result.options);
      setOptionId(result.options[0]?.id ?? "");
      setSlotError(result.error ?? null);
    });
  }

  const soldOut = option?.seatsLeft === 0;
  const busy = submitting || handingOff;
  const canBook = Boolean(date && time && option && !soldOut && !loadingSlot);
  const maxQty = option ? maxSelectable(option) : 1;
  const perGroup = Boolean(option && option.maxPerOrder > 1);
  const errorMessage = slotError ?? (state.status === "error" ? state.message : null);

  return (
    <form
      action={formAction}
      onSubmit={() => {
        trackBeginCheckout(
          { currency, value: total, items: [analyticsItem(tour, option, qty)] },
          hasAnalyticsConsent
        );
      }}
      className="space-y-5"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="variationId" value={variationId} />
      <input type="hidden" name="optionId" value={optionId} />
      <input type="hidden" name="date" value={date ?? ""} />
      <input type="hidden" name="time" value={time ?? ""} />
      <input type="hidden" name="qty" value={qty} />

      <div>
        <PriceDisplay
          price={option ? option.price : { amount: 0, wasAmount: null, currency }}
          size="lg"
          unit={perGroup ? "per group" : "per person"}
        />
        {option?.seatsLeft !== null && option !== undefined && option.seatsLeft <= 6 && !soldOut ? (
          <p className="mt-1 text-sm font-medium text-accent">
            Only {option.seatsLeft} {option.seatsLeft === 1 ? "place" : "places"} left
          </p>
        ) : null}
      </div>

      {variations.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Ticket type</legend>
          <div className="flex flex-wrap gap-2">
            {variations.map((variation) => (
              <Chip
                key={variation.id}
                pressed={variationId === variation.id}
                onClick={() => {
                  setVariationId(variation.id);
                  setDate(null);
                  setTime(null);
                  setOptions([]);
                  setOptionId("");
                }}
              >
                {variation.name}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <p className="flex items-center justify-between text-sm">
          <span className="font-medium" id="booking-date-label">
            Pick a date
          </span>
          <span className="text-muted-foreground">
            {date ? formatLongDate(date) : "Highlighted days are available"}
          </span>
        </p>
        <div className="rounded-2xl border bg-card p-3" aria-labelledby="booking-date-label">
          <AvailabilityCalendar
            availability={availability}
            selected={date}
            onSelect={selectDate}
            minDate={minDate}
          />
        </div>
      </div>

      {times.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Departure time</legend>
          <div className="flex flex-wrap gap-2">
            {times.map((slot) => (
              <Chip key={slot} pressed={time === slot} onClick={() => setTime(slot)}>
                {slot.slice(0, 5)}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      {options.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Option</legend>
          <div className="space-y-2">
            {options.map((candidate) => (
              <label
                key={candidate.id}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 text-sm transition-colors",
                  optionId === candidate.id
                    ? "border-primary-strong bg-primary-strong/5"
                    : "border-input hover:bg-muted"
                )}
              >
                <span className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="optionChoice"
                    value={candidate.id}
                    checked={optionId === candidate.id}
                    onChange={() => setOptionId(candidate.id)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="font-medium">{candidate.name}</span>
                    {candidate.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {candidate.description}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPrice(candidate.price.amount, candidate.price.currency)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium" id="qty-label">
          {perGroup ? "Groups" : "Guests"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setQty((n) => Math.max(option ? Math.max(option.minPerOrder, 1) : 1, n - 1))}
            disabled={qty <= (option ? Math.max(option.minPerOrder, 1) : 1)}
            aria-label="One fewer"
          >
            <Minus />
          </Button>
          <output aria-labelledby="qty-label" className="w-8 text-center text-lg font-semibold tabular-nums">
            {qty}
          </output>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
            disabled={qty >= maxQty}
            aria-label="One more"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {/* What is about to be reserved, in one glance, next to what it costs. */}
      {date && time && option ? (
        <div className="space-y-2 rounded-2xl bg-muted/60 p-4 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-muted-foreground">
            <dt className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="sr-only">Date</span>
            </dt>
            <dd className="text-foreground">{formatLongDate(date)}</dd>
            <dt className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              <span className="sr-only">Departure</span>
            </dt>
            <dd className="text-foreground">{time.slice(0, 5)}</dd>
            <dt className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              <span className="sr-only">{perGroup ? "Groups" : "Guests"}</span>
            </dt>
            <dd className="text-foreground">
              {qty} {perGroup ? (qty === 1 ? "group" : "groups") : qty === 1 ? "guest" : "guests"}
            </dd>
          </dl>
          <div className="flex items-baseline justify-between border-t border-border/70 pt-2">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatPrice(total, option.price.currency)}</span>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </p>
      ) : null}

      {/*
        The shared Button's default teal (#5dafa9) gives white text only 2.50:1.
        The booking CTAs use the deeper --primary-strong stop (4.53:1) so the
        most important control in the funnel meets AA. Changing the shared token
        would restyle every page on the site, which is not this change's job.
      */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-primary-strong hover:bg-primary-strong/90"
        disabled={!canBook || busy}
      >
        {busy || loadingSlot ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {handingOff
          ? "Taking you to secure payment…"
          : submitting
            ? "Reserving your places…"
            : soldOut
              ? "Sold out — pick another date"
              : date
                ? "Reserve your places"
                : "Choose a date"}
        {!busy && canBook ? <ArrowRight aria-hidden="true" /> : null}
      </Button>

      <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Your places are held for 20 minutes while you enter your details and pay on
          Regiondo&apos;s secure checkout. We never see your card details.
        </span>
      </p>
    </form>
  );
}

/**
 * Leave for Regiondo through a real link, not `window.location.assign`.
 *
 * GA4's cross-domain linker keeps the session alive across domains by
 * appending a `_gl=` token to outbound URLs — but it only does so for
 * navigations it can observe: a click on an anchor (it listens on
 * `mousedown`/`keyup`) or a form submit. A programmatic `location.assign`
 * bypasses it, and every purchase on Regiondo's page would then start a fresh
 * session with `regiondo.com` as its referrer. So: an anchor, a synthetic
 * `mousedown` for the linker, then the click. A normal navigation in the
 * history (Back returns here with the date still chosen).
 */
function navigateViaLink(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
  anchor.click();
  anchor.remove();
}

/** A toggle pill: ticket type, departure time. */
function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        pressed
          ? "border-primary-strong bg-primary-strong text-primary-foreground"
          : "border-input hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function analyticsItem(
  tour: BookingPanelProps["tour"],
  option: TourOption | undefined,
  qty: number
) {
  return {
    item_id: tour.id,
    item_name: tour.title,
    ...(tour.category ? { item_category: tour.category } : {}),
    price: option?.price.amount ?? 0,
    quantity: qty,
  };
}

/**
 * `max_qty_to_sell` of 0 means "no per-order cap" in Regiondo's vocabulary, not
 * "nothing may be sold". Seats left is the real ceiling; 10 is a sane UI cap
 * for a tour with no other limit.
 */
function maxSelectable(option: TourOption): number {
  const perOrder = option.maxPerOrder > 0 ? option.maxPerOrder : 10;
  const stock = option.seatsLeft ?? perOrder;
  return Math.max(1, Math.min(perOrder, stock));
}

function clampQty(current: number, option: TourOption): number {
  return Math.min(Math.max(current, Math.max(option.minPerOrder, 1)), maxSelectable(option));
}

function formatLongDate(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
