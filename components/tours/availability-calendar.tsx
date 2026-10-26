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
 * the largest thing on a tour page that is not an image, and it is not needed
 * for the static shell. It is shown inline and always open — a calendar you
 * have to click to reveal, and that closes as soon as you pick, made choosing a
 * date feel like operating a dropdown.
 *
 * Layout notes. The month caption and the two arrows share one row: the
 * caption is centred with side padding wide enough for the arrows, and the
 * nav is absolutely positioned inside `months`, which is `relative` for that
 * purpose (the earlier version overrode `.rdp-months` without keeping it
 * positioned, so the arrows anchored to whatever ancestor happened to be —
 * the "quirky" nav). Month changes animate with the library's own slide.
 *
 * Available days are the exception in a month of unavailable ones, so they
 * are what gets styled: a filled disc, with the rest left quiet. Unavailable
 * days are muted rather than struck through — a whole month of strike-throughs
 * read as an error.
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
  const availableDates = Object.keys(availability).sort();

  const isAvailable = (date: Date) => availability[toDateKey(date)] !== undefined;

  const firstAvailable = availableDates[0] ? parseDateKey(availableDates[0]) : undefined;
  const lastAvailable = availableDates.length
    ? parseDateKey(availableDates[availableDates.length - 1]!)
    : undefined;

  return (
    <DayPicker
      mode="single"
      required={false}
      animate
      selected={selected ? parseDateKey(selected) : undefined}
      onSelect={(date) => {
        if (date) onSelect(toDateKey(date));
      }}
      disabled={(date) => !isAvailable(date)}
      // The selected day is left out of `available` on purpose: the two
      // modifier styles have equal specificity, and the available disc was
      // winning over the selected one by source order.
      modifiers={{ available: (date) => isAvailable(date) && toDateKey(date) !== selected }}
      // Open on the month that has something to choose, not on today's month
      // when the next departure is six weeks away.
      defaultMonth={selected ? parseDateKey(selected) : firstAvailable}
      startMonth={minDate}
      endMonth={lastAvailable}
      showOutsideDays={false}
      className={cn("rdp-beavita w-full text-sm")}
      classNames={{
        months: "relative flex flex-col",
        month: "w-full space-y-2",
        month_caption: "flex h-9 items-center justify-center px-10 text-base font-semibold",
        caption_label: "truncate",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
        button_previous:
          "inline-flex size-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30",
        button_next:
          "inline-flex size-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30",
        chevron: "size-4 fill-current",
        month_grid: "w-full table-fixed border-collapse",
        weekdays: "",
        weekday: "h-8 text-center text-xs font-medium text-muted-foreground",
        week: "",
        day: "p-0 text-center",
        day_button: cn(
          "mx-auto my-0.5 inline-flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        ),
        selected: "",
        today: "",
        disabled: "",
        outside: "invisible",
      }}
      modifiersClassNames={{
        available:
          "[&_button]:bg-primary/12 [&_button]:font-semibold [&_button]:text-foreground [&_button:hover]:bg-primary/25",
        selected:
          "[&_button]:bg-primary-strong [&_button]:text-primary-foreground [&_button:hover]:bg-primary-strong",
        disabled: "[&_button]:text-muted-foreground/45 [&_button]:cursor-default",
        today: "[&_button]:underline [&_button]:underline-offset-4",
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
