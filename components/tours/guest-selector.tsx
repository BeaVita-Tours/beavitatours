"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/tours/price-display";
import {
  headroomFor,
  isGroupOption,
  isSoldOut,
  maxSelectable,
  minSelectable,
  type PartyQuantities,
  stepQty,
} from "@/lib/regiondo/party";
import type { TourOption } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

/**
 * The shared outline Button hovers in the brand coral, which on a "−" reads
 * as destructive and on a "+" as an alert. A quantity control wants a quiet,
 * neutral press state.
 */
const STEPPER_BUTTON =
  "rounded-full hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-40";

interface GuestSelectorProps {
  options: readonly TourOption[];
  quantities: PartyQuantities;
  /**
   * Places the departure has left across every tier — Adult and Young share
   * the same coach, so once the party fills it every "+" stops. Null when
   * the API did not say, in which case each tier's own stock is the limit.
   */
  slotSeats: number | null;
  onChange: (next: PartyQuantities) => void;
  /** Greys the rows while a new slot's options are loading. */
  disabled?: boolean;
}

/**
 * One row per participant tier, each with its own stepper — the fix for the
 * old "pick one option, then a number" panel, which made "2 Adults + 2 Young"
 * impossible to express.
 *
 * Each row states what a person needs to decide: the tier's name (the age
 * range is in it, "Young (7-14)"), its price — the biggest thing on the row,
 * since it is what differs between tiers — any per-booking rule, and how
 * much stock is left when that is tight. The stepper snaps to the tier's
 * minimum from zero and back to zero from the minimum, so a "book for at
 * least 2" tier can never sit at 1.
 */
export function GuestSelector({
  options,
  quantities,
  slotSeats,
  onChange,
  disabled,
}: GuestSelectorProps) {
  if (options.length === 0) return null;

  function update(option: TourOption, qty: number) {
    const next: Record<string, number> = { ...quantities };
    if (qty > 0) next[option.id] = qty;
    else delete next[option.id];
    onChange(next);
  }

  const partySize = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const full = slotSeats !== null && partySize >= slotSeats && slotSeats > 0;

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="mb-2 flex w-full items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">
          {options.length > 1 ? "Who is coming?" : isGroupOption(options[0]!) ? "Groups" : "Guests"}
        </span>
        {full ? (
          <span className="text-xs text-muted-foreground">
            All {slotSeats} remaining {slotSeats === 1 ? "place" : "places"} taken
          </span>
        ) : null}
      </legend>
      <ul className="divide-y rounded-2xl border bg-card">
        {options.map((option) => (
          <GuestRow
            key={option.id}
            option={option}
            qty={quantities[option.id] ?? 0}
            headroom={headroomFor(quantities, option.id, slotSeats)}
            slotSeats={slotSeats}
            onChange={(qty) => update(option, qty)}
            disabled={disabled}
          />
        ))}
      </ul>
    </fieldset>
  );
}

function GuestRow({
  option,
  qty,
  headroom,
  slotSeats,
  onChange,
  disabled,
}: {
  option: TourOption;
  qty: number;
  headroom: number | null;
  slotSeats: number | null;
  onChange: (qty: number) => void;
  disabled?: boolean;
}) {
  const soldOut = isSoldOut(option);
  const min = minSelectable(option);
  const max = maxSelectable(option, headroom);
  const perGroup = isGroupOption(option);
  const unit = perGroup ? "per group" : "per person";
  const rules = describeRules(option, min, slotSeats);
  const nameId = `guest-${option.id}-name`;
  const qtyId = `guest-${option.id}-qty`;
  // "+" is off when this tier is at its own ceiling, or when the departure is
  // full — `max` already folds the headroom in, so one comparison covers both.
  const canAdd = !soldOut && stepQty(option, qty, 1, headroom) > qty;

  return (
    <li
      className={cn(
        "flex items-center justify-between gap-4 p-3 sm:p-4",
        soldOut && "opacity-60"
      )}
    >
      <div className="min-w-0 space-y-1">
        <p id={nameId} className="text-sm font-medium leading-tight text-foreground/90">
          {option.name}
        </p>
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-lg font-bold leading-none tabular-nums">
            {formatPrice(option.price.amount, option.price.currency)}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
          {option.price.wasAmount !== null ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(option.price.wasAmount, option.price.currency)}
            </span>
          ) : null}
        </p>
        {option.description ? (
          <p className="text-xs leading-snug text-muted-foreground">{option.description}</p>
        ) : null}
        {soldOut ? (
          <p className="text-xs font-medium text-destructive">Sold out for this departure</p>
        ) : rules ? (
          <p className="text-xs text-muted-foreground">{rules}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1.5" role="group" aria-labelledby={nameId}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={STEPPER_BUTTON}
          onClick={() => onChange(stepQty(option, qty, -1, headroom))}
          disabled={disabled || soldOut || qty <= 0}
          aria-label={`Remove one ${option.name}`}
          aria-describedby={qtyId}
        >
          <Minus />
        </Button>
        <output
          id={qtyId}
          aria-live="polite"
          aria-label={`${option.name} quantity`}
          className={cn(
            "w-7 text-center text-lg font-semibold tabular-nums",
            qty === 0 && "text-muted-foreground"
          )}
        >
          {qty}
        </output>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={STEPPER_BUTTON}
          onClick={() => onChange(stepQty(option, qty, 1, headroom))}
          disabled={disabled || !canAdd || qty >= max}
          aria-label={`Add one ${option.name}`}
          aria-describedby={qtyId}
        >
          <Plus />
        </Button>
      </div>
    </li>
  );
}

/**
 * The tier's constraints, in one short line. Only what is worth saying: a
 * minimum above one, a per-booking cap, and the tier's stock when it is tight
 * *and tighter than the departure's* — when the coach is what limits, the
 * panel already says so once above the rows, and repeating "only 5 left" on
 * every tier would read as five places each. Nothing when none apply.
 */
function describeRules(option: TourOption, min: number, slotSeats: number | null): string | null {
  const parts: string[] = [];
  if (min > 1) parts.push(`min. ${min} per booking`);
  if (option.maxPerOrder > 0) parts.push(`max. ${option.maxPerOrder} per booking`);
  const tierIsTighter = slotSeats === null || (option.seatsLeft ?? Infinity) < slotSeats;
  if (option.seatsLeft !== null && option.seatsLeft > 0 && option.seatsLeft <= 6 && tierIsTighter) {
    parts.push(`only ${option.seatsLeft} left`);
  }
  if (parts.length === 0) return null;
  const line = parts.join(" · ");
  return line.charAt(0).toUpperCase() + line.slice(1);
}
