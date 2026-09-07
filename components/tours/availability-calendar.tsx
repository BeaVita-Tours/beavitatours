"use client";

import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

interface AvailabilityCalendarProps {
  /** date (YYYY-MM-DD) -> start times. Only these dates are selectable. */
  availability: Readonly<Record<string, readonly string[]>>;
  selected: string | null;
  onSelect: (date: string) => void;
  /** Earliest bookable date, after the supplier's booking notice period. */
  minDate: Date;
}

/**
 * The date picker.
 *
 * Lazy-loaded from the booking panel: `react-day-picker` plus its stylesheet is
 * the largest thing on a tour page that is not an image, and most visitors read
 * the page before they touch a calendar. Loading it on first interaction keeps
 * it off the critical path entirely.
 *
 * Dates are handled as `YYYY-MM-DD` strings throughout, never as `Date` objects
 * crossing a boundary. Regiondo's calendar is in the tour's own time zone
 * (Europe/Rome), and a `Date` would be interpreted in the browser's — which for
 * a visitor west of Greenwich silently shifts every departure back a day.
 */
export function AvailabilityCalendar({
  availability,
  selected,
  onSelect,
  minDate,
}: AvailabilityCalendarProps) {
  const availableDates = Object.keys(availability);

  const isAvailable = (date: Date) => availability[toDateKey(date)] !== undefined;

  const lastAvailable = availableDates.length
    ? parseDateKey(availableDates[availableDates.length - 1]!)
    : undefined;

  return (
    <DayPicker
      mode="single"
      required={false}
      selected={selected ? parseDateKey(selected) : undefined}
      onSelect={(date) => {
        if (date) onSelect(toDateKey(date));
      }}
      disabled={(date) => !isAvailable(date)}
      startMonth={minDate}
      endMonth={lastAvailable}
      showOutsideDays={false}
      // The panel already has an h3; the calendar's own caption should not
      // introduce a competing heading level.
      className={cn("rdp-beavita text-sm")}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex items-center justify-center py-1 font-semibold",
        nav: "flex items-center justify-between absolute inset-x-0 top-0",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-xl hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-xs font-medium text-muted-foreground",
        week: "flex w-full",
        day: "p-0.5",
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-xl text-sm transition-colors",
          "hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        ),
        selected: "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:font-semibold",
        today: "[&_button]:ring-1 [&_button]:ring-primary/40",
        disabled: "[&_button]:text-muted-foreground/35 [&_button]:line-through [&_button]:hover:bg-transparent",
        outside: "invisible",
      }}
    />
  );
}

/** Local calendar date as YYYY-MM-DD. Never `toISOString`, which is UTC. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parse YYYY-MM-DD as local midnight, matching `toDateKey`. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}
