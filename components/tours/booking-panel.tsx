"use client";

import dynamic from "next/dynamic";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { startBooking } from "@/app/(site)/book/actions";
import { IDLE } from "@/lib/regiondo/action-state";
import {
  loadAvailability,
  loadSlotOptions,
} from "@/app/(site)/tours/[slug]/actions";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestSelector } from "@/components/tours/guest-selector";
import { formatPrice, PriceDisplay } from "@/components/tours/price-display";
import { trackBeginCheckout, trackPaymentHandoff } from "@/lib/analytics";
import {
  countLabel,
  defaultQuantities,
  isGroupOption,
  lowestPrice,
  normalizeQuantities,
  type PartyQuantities,
  type PartySummary,
  serializeLines,
  summarizeParty,
} from "@/lib/regiondo/party";
import type {
  TourAvailability,
  TourOption,
  TourVariation,
} from "@/lib/regiondo/types";
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
  availability: TourAvailability;
  /** Options for the first available slot, so the panel opens with a price. */
  initialOptions: readonly TourOption[];
  /** Places the first slot has left across every tier; null when unknown. */
  initialSeatsLeft: number | null;
  initialDate: string | null;
  initialTime: string | null;
  currency: string;
  /** Hours of lead time the supplier needs, from the product. */
  bookingNoticeHours: number;
}

/** What survives a reload or a round trip to Regiondo and back. */
interface StoredSelection {
  variationId: string;
  date: string | null;
  time: string | null;
  quantities: PartyQuantities;
}

/** Days of availability fetched when the visitor switches ticket type. */
const AVAILABILITY_WINDOW_DAYS = 100;

/**
 * The booking panel: date, time, who is coming — then one button that holds
 * the places and sends the customer to Regiondo's checkout, where they enter
 * their details and pay. Nothing is asked here that Regiondo asks again
 * (D-019).
 *
 * "Who is coming" is a quantity per participant tier (Adult, Young, …), not
 * one tier plus a number: a family of two adults and two children is two
 * lines, and the server places one hold per line under a single checkout.
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
  availability: initialAvailability,
  initialOptions,
  initialSeatsLeft,
  initialDate,
  initialTime,
  currency,
  bookingNoticeHours,
}: BookingPanelProps) {
  const firstVariationId = variations[0]?.id ?? "";
  const [variationId, setVariationId] = useState(firstVariationId);
  const [availabilityByVariation, setAvailabilityByVariation] = useState<
    Record<string, TourAvailability>
  >(() =>
    firstVariationId ? { [firstVariationId]: initialAvailability } : {},
  );
  const [date, setDate] = useState<string | null>(initialDate);
  const [time, setTime] = useState<string | null>(initialTime);
  const [options, setOptions] = useState<readonly TourOption[]>(initialOptions);
  const [slotSeats, setSlotSeats] = useState<number | null>(initialSeatsLeft);
  const [quantities, setQuantities] = useState<PartyQuantities>(() =>
    defaultQuantities(initialOptions),
  );
  const [slotError, setSlotError] = useState<string | null>(null);
  const [loadingSlot, startSlotLoad] = useTransition();
  const [handingOff, setHandingOff] = useState(false);

  const [state, formAction, submitting] = useActionState(startBooking, IDLE);
  const { hasAnalyticsConsent } = useCookieConsent();

  const availability = availabilityByVariation[variationId] ?? {};
  const times = date ? (availability[date] ?? []) : [];
  const party = summarizeParty(options, quantities, currency, slotSeats);
  const storageKey = `booking:${slug}`;

  const minDate = useMemo(() => {
    const earliest = new Date();
    earliest.setHours(earliest.getHours() + bookingNoticeHours);
    return earliest;
  }, [bookingNoticeHours]);

  // ---- persistence -------------------------------------------------------
  // The selection survives a reload and the trip to Regiondo and back: a
  // visitor who compares dates in two tabs, or comes back from the checkout
  // to change something, should not have to rebuild their party. Session
  // storage, so it dies with the tab; restored after mount so the server and
  // client HTML still match.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const stored = readSelection(storageKey);
    if (!stored || stored.variationId !== variationId) return;

    const sameSlot = stored.date === date && stored.time === time;
    if (sameSlot || !stored.date || !stored.time) {
      setQuantities((current) => {
        const fitted = normalizeQuantities(
          options,
          stored.quantities,
          slotSeats,
        );
        return Object.keys(fitted).length > 0 ? fitted : current;
      });
      return;
    }
    const storedTimes = availability[stored.date] ?? [];
    if (!storedTimes.includes(stored.time)) return;
    changeSlot(stored.date, stored.time, stored.quantities);
    // Mount-only by design; everything it reads is the initial render's.
    // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate — see above
  }, []);

  useEffect(() => {
    writeSelection(storageKey, { variationId, date, time, quantities });
  }, [storageKey, variationId, date, time, quantities]);

  // ---- handoff -----------------------------------------------------------
  useEffect(() => {
    if (state.status !== "handoff") return;
    setHandingOff(true);
    trackPaymentHandoff(
      {
        currency: party.currency,
        value: party.total,
        items: analyticsItems(tour, party),
      },
      hasAnalyticsConsent,
    );
    navigateViaLink(state.checkoutUrl);
    // Fire once per handoff state, not on every consent or price tick.
    // biome-ignore lint/correctness/useExhaustiveDependencies: deliberate — see above
  }, [state]);

  // ---- slot changes ------------------------------------------------------

  /**
   * Move to a departure and refetch its options. Seat counts move while the
   * page is open, so options are never reused across slots. The party is
   * re-fitted to the new options rather than reset: what the visitor chose
   * survives as far as the new stock allows.
   */
  function changeSlot(
    nextDate: string,
    nextTime: string,
    keep: PartyQuantities = quantities,
  ) {
    setDate(nextDate);
    setTime(nextTime);
    setSlotError(null);
    startSlotLoad(async () => {
      const result = await loadSlotOptions({
        variationId,
        date: nextDate,
        time: nextTime,
      });
      setOptions(result.options);
      setSlotSeats(result.seatsLeft);
      setQuantities(() => {
        const fitted = normalizeQuantities(
          result.options,
          keep,
          result.seatsLeft,
        );
        return Object.keys(fitted).length > 0
          ? fitted
          : defaultQuantities(result.options);
      });
      setSlotError(result.error ?? null);
    });
  }

  function selectDate(next: string) {
    const nextTime = availability[next]?.[0] ?? null;
    if (!nextTime) {
      setDate(next);
      setTime(null);
      return;
    }
    changeSlot(next, nextTime);
  }

  function selectTime(next: string) {
    if (!date) return;
    changeSlot(date, next);
  }

  /**
   * Switch ticket type (a product's variations: "Ticket" vs "Group"). Each
   * variation has its own calendar, fetched on first use; the panel then opens
   * on its first departure so there is always a price on screen.
   */
  function selectVariation(next: string) {
    if (next === variationId) return;
    setVariationId(next);
    setDate(null);
    setTime(null);
    setOptions([]);
    setSlotSeats(null);
    setQuantities({});
    setSlotError(null);

    startSlotLoad(async () => {
      let calendar = availabilityByVariation[next];
      if (!calendar) {
        const from = toDateKey(minDate);
        const to = toDateKey(addDays(minDate, AVAILABILITY_WINDOW_DAYS));
        const result = await loadAvailability({ variationId: next, from, to });
        if (result.error) {
          setSlotError(result.error);
          return;
        }
        calendar = result.availability;
        setAvailabilityByVariation((current) => ({
          ...current,
          [next]: calendar!,
        }));
      }
      const firstDate = Object.keys(calendar).sort()[0];
      const firstTime = firstDate ? calendar[firstDate]?.[0] : undefined;
      if (!firstDate || !firstTime) {
        setSlotError("No dates are open for this ticket type at the moment.");
        return;
      }
      const result = await loadSlotOptions({
        variationId: next,
        date: firstDate,
        time: firstTime,
      });
      setDate(firstDate);
      setTime(firstTime);
      setOptions(result.options);
      setSlotSeats(result.seatsLeft);
      setQuantities(defaultQuantities(result.options));
      setSlotError(result.error ?? null);
    });
  }

  // ---- derived -----------------------------------------------------------
  const soldOut =
    slotSeats === 0 ||
    (options.length > 0 && options.every((option) => option.seatsLeft === 0));
  const busy = submitting || handingOff;
  const hasParty = party.count > 0;
  const canBook = Boolean(date && time && hasParty && !soldOut && !loadingSlot);
  const errorMessage =
    slotError ?? (state.status === "error" ? state.message : null);

  const headlinePrice = lowestPrice(options);
  const headlineUnit =
    options.length > 0 && options.every(isGroupOption)
      ? "per group"
      : "per person";

  return (
    <form
      action={formAction}
      onSubmit={() => {
        trackBeginCheckout(
          {
            currency: party.currency,
            value: party.total,
            items: analyticsItems(tour, party),
          },
          hasAnalyticsConsent,
        );
      }}
      className="space-y-5"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="variationId" value={variationId} />
      <input type="hidden" name="date" value={date ?? ""} />
      <input type="hidden" name="time" value={time ?? ""} />
      {serializeLines(quantities).map((line) => (
        <input key={line} type="hidden" name="line" value={line} />
      ))}

      <div>
        <PriceDisplay
          price={headlinePrice ?? { amount: 0, wasAmount: null, currency }}
          showFrom={options.length > 1}
          size="lg"
          unit={headlineUnit}
        />
        {soldOut ? (
          <p className="mt-1 text-sm font-medium text-destructive">
            This departure is sold out — pick another date.
          </p>
        ) : slotSeats !== null && slotSeats <= 10 ? (
          <p className="mt-1 text-sm font-medium text-accent">
            Only {slotSeats} {slotSeats === 1 ? "place" : "places"} left on this
            departure
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
                onClick={() => selectVariation(variation.id)}
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
        <div
          className="rounded-2xl border bg-card p-3"
          aria-labelledby="booking-date-label"
        >
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
              <Chip
                key={slot}
                pressed={time === slot}
                onClick={() => selectTime(slot)}
              >
                {slot.slice(0, 5)}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      {loadingSlot && options.length === 0 ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : (
        <GuestSelector
          options={options}
          quantities={quantities}
          slotSeats={slotSeats}
          onChange={setQuantities}
          disabled={loadingSlot}
        />
      )}

      {/* What is about to be reserved, in one glance, next to what it costs. */}
      {date && time && options.length > 0 ? (
        <div
          className={cn(
            "space-y-2 rounded-2xl bg-muted/60 p-4 text-sm transition-opacity",
            loadingSlot && "opacity-60",
          )}
          aria-live="polite"
        >
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
            <dt className="flex items-start gap-1.5 pt-0.5">
              <Users className="size-4" aria-hidden="true" />
              <span className="sr-only">Party</span>
            </dt>
            <dd className="text-foreground">
              {hasParty ? (
                <ul className="space-y-0.5">
                  {party.lines.map((line) => (
                    <li
                      key={line.option.id}
                      className="flex justify-between gap-3"
                    >
                      <span>
                        {line.qty} × {line.option.name}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatPrice(
                          line.lineTotal,
                          line.option.price.currency,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">
                  Add at least one guest
                </span>
              )}
            </dd>
          </dl>
          <div className="flex items-baseline justify-between border-t border-border/70 pt-2">
            <span className="font-medium">
              Total
              {hasParty ? (
                <span className="ml-1.5 font-normal text-muted-foreground">
                  · {countLabel(party.count, party.perGroup)}
                </span>
              ) : null}
            </span>
            <output
              aria-label="Total price"
              className="text-xl font-bold tabular-nums"
            >
              {formatPrice(party.total, party.currency)}
            </output>
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
        {busy || loadingSlot ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : null}
        {handingOff
          ? "Taking you to secure payment…"
          : submitting
            ? "Reserving your places…"
            : soldOut
              ? "Sold out — pick another date"
              : !date
                ? "Choose a date"
                : "Reserve your places"}
        {!busy ? <ArrowRight aria-hidden="true" /> : null}
      </Button>

      <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Your places are held for 20 minutes while you enter your details and
          pay on Regiondo&apos;s secure checkout. We never see your card
          details.
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

/** One ecommerce item per tier, so the events carry the real basket. */
function analyticsItems(tour: BookingPanelProps["tour"], party: PartySummary) {
  return party.lines.map((line) => ({
    item_id: tour.id,
    item_name: tour.title,
    ...(tour.category ? { item_category: tour.category } : {}),
    item_variant: line.option.name,
    price: line.option.price.amount,
    quantity: line.qty,
  }));
}

function readSelection(key: string): StoredSelection | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<StoredSelection>;
    if (typeof candidate.variationId !== "string") return null;
    const quantities: Record<string, number> = {};
    for (const [id, qty] of Object.entries(candidate.quantities ?? {})) {
      if (/^\d+$/.test(id) && typeof qty === "number" && qty > 0)
        quantities[id] = qty;
    }
    return {
      variationId: candidate.variationId,
      date: typeof candidate.date === "string" ? candidate.date : null,
      time: typeof candidate.time === "string" ? candidate.time : null,
      quantities,
    };
  } catch {
    return null;
  }
}

function writeSelection(key: string, selection: StoredSelection): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(selection));
  } catch {
    // Private mode or a full store: the panel simply forgets on reload.
  }
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
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
