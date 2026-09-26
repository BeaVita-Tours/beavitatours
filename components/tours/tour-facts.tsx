import { Check, Clock, Globe, MapPin, Users } from "lucide-react";

import type { SafeHtml, TourDetail } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

/**
 * The key-facts strip and the prose sections below the gallery.
 *
 * Both render server-side from cached catalog data, which is the whole point:
 * this is the content Google could not see through the iframe.
 */

type Fact = { icon: typeof Clock; label: string; value: string };

function tourFacts(tour: TourDetail): Fact[] {
  return [
    tour.duration && { icon: Clock, label: "Duration", value: tour.duration.label },
    tour.meetingPoint.name && {
      icon: MapPin,
      label: "Departs from",
      value: tour.meetingPoint.name,
    },
    tour.languages.length > 0 && {
      icon: Globe,
      label: "Guided in",
      value: tour.languages.join(", "),
    },
    tour.collections.length > 0 && {
      icon: Users,
      label: "Group",
      value: tour.collections[0]?.includes("Private") ? "Private tour" : "Small shared group",
    },
  ].filter(Boolean) as Fact[];
}

/**
 * The key facts as a row of pill badges — the "badges" strip under the
 * image + booking box on the tour page. Same data as `TourFacts`, lighter
 * treatment: one line, wraps on narrow screens.
 */
export function TourBadges({ tour }: { tour: TourDetail }) {
  const facts = tourFacts(tour);
  if (facts.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Key facts">
      {facts.map((fact) => (
        <li
          key={fact.label}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm"
        >
          <fact.icon className="size-3.5 shrink-0 text-primary-strong" aria-hidden="true" />
          <span className="sr-only">{fact.label}: </span>
          <span className="font-medium">{fact.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function TourFacts({ tour }: { tour: TourDetail }) {
  const facts = tourFacts(tour);

  if (facts.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-4">
      {facts.map((fact) => (
        // Each dt/dd pair sits in exactly one wrapping div, which is the only
        // nesting the HTML spec (and axe's definition-list rule) allows inside
        // a <dl>. The icon therefore goes inside the <dt> rather than beside it.
        <div key={fact.label} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <fact.icon className="size-3.5 shrink-0 text-primary-strong" aria-hidden="true" />
            {fact.label}
          </dt>
          <dd className="mt-1 text-sm font-medium">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The highlights list. `variant="card"` is the tinted panel that sits beside
 * the description on the tour page — one column, so it reads as a side note
 * to the prose rather than a second body of text.
 */
export function TourHighlights({
  highlights,
  variant = "plain",
}: {
  highlights: readonly string[];
  variant?: "plain" | "card";
}) {
  if (highlights.length === 0) return null;

  const card = variant === "card";

  return (
    <section
      aria-labelledby="highlights-heading"
      className={cn(
        "space-y-3",
        card && "h-fit rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6"
      )}
    >
      <h2 id="highlights-heading" className={cn("font-bold", card ? "text-xl" : "text-2xl")}>
        Highlights
      </h2>
      <ul className={cn("grid gap-2.5", !card && "sm:grid-cols-2")}>
        {highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2.5 text-sm leading-relaxed">
            <Check
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary-strong"
              strokeWidth={2.5}
            />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Prose from Regiondo. The HTML has already been through `sanitizeHtml` at the
 * API boundary — the `SafeHtml` brand on the prop is there so that a raw string
 * cannot be passed here by accident.
 */
export function TourProse({
  id,
  heading,
  html,
}: {
  id: string;
  heading: string;
  html: SafeHtml | null;
}) {
  if (!html) return null;

  return (
    <section aria-labelledby={`${id}-heading`} className="min-w-0 space-y-3">
      <h2 id={`${id}-heading`} className="text-xl font-bold">
        {heading}
      </h2>
      <div
        className="prose prose-blog max-w-none text-sm leading-relaxed"
        // Sanitised in lib/regiondo/sanitize.ts against a narrow allowlist:
        // no script, no iframe, no event handlers, no inline styles.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

/** Two-column included / not-included list, the standard OTA treatment. */
export function TourInclusions({ tour, className }: { tour: TourDetail; className?: string }) {
  if (!tour.includedHtml && !tour.notIncludedHtml) return null;

  return (
    <section aria-labelledby="inclusions-heading" className={cn("space-y-3", className)}>
      <h2 id="inclusions-heading" className="text-xl font-bold">
        What is included
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {tour.includedHtml ? (
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-strong">
              Included
            </h3>
            <div
              className="prose prose-blog max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: tour.includedHtml }}
            />
          </div>
        ) : null}
        {tour.notIncludedHtml ? (
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Not included
            </h3>
            <div
              className="prose prose-blog max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: tour.notIncludedHtml }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Meeting point. A static map would be another third-party request on a page
 * whose whole reason for existing is that it does not make third-party requests,
 * so this is text plus a link out — the visitor gets directions in the app they
 * already use, and the page stays fast.
 */
export function TourMeetingPoint({ tour }: { tour: TourDetail }) {
  const { name, address, info, lat, lon } = tour.meetingPoint;
  if (!name && !address) return null;

  const query = lat !== null && lon !== null ? `${lat},${lon}` : (address ?? name ?? "");

  return (
    <section aria-labelledby="meeting-heading" className="min-w-0 space-y-3">
      <h2 id="meeting-heading" className="text-xl font-bold">
        Where we meet
      </h2>
      <div className="rounded-2xl border bg-card p-5">
        {name ? <p className="font-medium">{name}</p> : null}
        {address ? <p className="mt-0.5 text-sm text-muted-foreground">{address}</p> : null}
        {info ? <p className="mt-3 text-sm leading-relaxed">{info}</p> : null}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MapPin className="size-3.5" aria-hidden="true" />
          Open in Maps
        </a>
      </div>
    </section>
  );
}
