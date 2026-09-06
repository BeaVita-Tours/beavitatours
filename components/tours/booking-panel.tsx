"use client";

import dynamic from "next/dynamic";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, CalendarDays, Loader2, Minus, Plus, ShieldCheck } from "lucide-react";

import { startBooking } from "@/app/(site)/book/actions";
import { IDLE } from "@/lib/regiondo/action-state";
import { loadSlotOptions } from "@/app/(site)/tours/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, PriceDisplay } from "@/components/tours/price-display";
import type { TourOption, TourVariation } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

/**
 * The calendar is the heaviest dependency on a tour page and most visitors read
 * before they book, so it loads on demand rather than in the initial bundle.
 * `ssr: false` because it has nothing to contribute to the static shell — the
 * server-rendered summary above it is what needs to be in the HTML.
 */
const AvailabilityCalendar = dynamic(
  () => import("@/components/tours/availability-calendar").then((m) => m.AvailabilityCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[19rem] w-full" />,
  }
);

interface BookingPanelProps {
  slug: string;
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
  /** Attribution captured from the landing URL, forwarded through checkout. */
  utm?: Record<string, string>;
}

export function BookingPanel({
  slug,
  variations,
  availability,
  initialOptions,
  initialDate,
  initialTime,
  currency,
  bookingNoticeHours,
  utm,
}: BookingPanelProps) {
  const [variationId, setVariationId] = useState(variations[0]?.id ?? "");
  const [date, setDate] = useState<string | null>(initialDate);
  const [time, setTime] = useState<string | null>(initialTime);
  const [options, setOptions] = useState<readonly TourOption[]>(initialOptions);
  const [optionId, setOptionId] = useState(initialOptions[0]?.id ?? "");
  const [qty, setQty] = useState(() => Math.max(1, initialOptions[0]?.minPerOrder ?? 1));
  const [slotError, setSlotError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loadingSlot, startSlotLoad] = useTransition();

  const [state, formAction, submitting] = useActionState(startBooking, IDLE);

  const option = options.find((candidate) => candidate.id === optionId) ?? options[0];
  const times = date ? (availability[date] ?? []) : [];

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

  function selectDate(next: string) {
    setDate(next);
    setShowCalendar(false);
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
  const canBook = Boolean(date && time && option && !soldOut && !loadingSlot);
  const total = option ? option.price.amount * qty : 0;
  const maxQty = option ? maxSelectable(option) : 1;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="variationId" value={variationId} />
      <input type="hidden" name="optionId" value={optionId} />
      <input type="hidden" name="date" value={date ?? ""} />
      <input type="hidden" name="time" value={time ?? ""} />
      <input type="hidden" name="qty" value={qty} />
      {utm && Object.keys(utm).length > 0 ? (
        <input type="hidden" name="utm" value={JSON.stringify(utm)} />
      ) : null}

      <div>
        <PriceDisplay
          price={option ? option.price : { amount: 0, wasAmount: null, currency }}
          size="lg"
          unit={option && option.maxPerOrder > 1 ? "per group" : "per person"}
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
              <button
                key={variation.id}
                type="button"
                onClick={() => {
                  setVariationId(variation.id);
                  setDate(null);
                  setTime(null);
                  setOptions([]);
                  setOptionId("");
                  setShowCalendar(true);
                }}
                aria-pressed={variationId === variation.id}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  variationId === variation.id
                    ? "border-primary-strong bg-primary-strong text-primary-foreground"
                    : "border-input hover:bg-muted"
                )}
              >
                {variation.name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <span className="block text-sm font-medium" id="booking-date-label">
          Date
        </span>
        {/*
          `aria-labelledby` here would replace the button's accessible name with
          "Date" while it visibly reads "Mon, 7 September 2026" — a
          label-in-name mismatch, which breaks voice control ("click Monday the
          seventh" would not match). The visible text is the name; "Date" is
          supporting context, so it is `aria-describedby`.
        */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCalendar((open) => !open)}
          aria-expanded={showCalendar}
          aria-describedby="booking-date-label"
          className="w-full justify-start font-normal"
        >
          <CalendarDays aria-hidden="true" />
          {date ? formatLongDate(date) : "Choose a date"}
        </Button>

        {showCalendar ? (
          <div className="rounded-2xl border bg-card p-3">
            <AvailabilityCalendar
              availability={availability}
              selected={date}
              onSelect={selectDate}
              minDate={minDate}
            />
          </div>
        ) : null}
      </div>

      {times.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Departure time</legend>
          <div className="flex flex-wrap gap-2">
            {times.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                aria-pressed={time === slot}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  time === slot
                    ? "border-primary-strong bg-primary-strong text-primary-foreground"
                    : "border-input hover:bg-muted"
                )}
              >
                {slot.slice(0, 5)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : times.length === 1 && date ? (
        <p className="text-sm text-muted-foreground">
          Departs at <span className="font-medium text-foreground">{times[0]?.slice(0, 5)}</span>
        </p>
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

      <div className="space-y-2">
        <span className="block text-sm font-medium" id="qty-label">
          {option && option.maxPerOrder > 1 ? "Groups" : "Guests"}
        </span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQty((n) => Math.max(option ? Math.max(option.minPerOrder, 1) : 1, n - 1))}
            disabled={qty <= (option ? Math.max(option.minPerOrder, 1) : 1)}
            aria-label="One fewer"
          >
            <Minus />
          </Button>
          <output aria-labelledby="qty-label" className="w-8 text-center text-lg font-semibold">
            {qty}
          </output>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
            disabled={qty >= maxQty}
            aria-label="One more"
          >
            <Plus />
          </Button>
        </div>
      </div>

      {option && qty > 1 ? (
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{formatPrice(total, option.price.currency)}</span>
        </div>
      ) : null}

      {slotError || state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{slotError ?? state.message}</span>
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
        disabled={!canBook || submitting}
      >
        {submitting || loadingSlot ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : null}
        {soldOut ? "Sold out — pick another date" : date ? "Reserve your places" : "Choose a date"}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        Payment is taken securely by Regiondo. We never see your card details.
      </p>
    </form>
  );
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
