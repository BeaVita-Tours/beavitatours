import Link from "next/link";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PRIVATE_TOUR_INCLUDED,
  PRIVATE_TOUR_NOT_INCLUDED,
  PRIVATE_TOUR_RATES,
} from "@/lib/private-tours";

/**
 * The tailor-made offer, under the private catalog.
 *
 * Someone who has scrolled the private departures and not found their day is
 * exactly the person this is for, so it sits below the grid rather than above
 * it. Everything here came from the old `/rates` page; that page is gone and
 * redirects here.
 */
export function PrivateTourRates() {
  return (
    <section
      aria-labelledby="tailor-made-heading"
      className="rounded-3xl border border-border bg-muted/40 p-6 md:p-10"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
              Tailor-made
            </p>
            <h2 id="tailor-made-heading" className="text-3xl font-bold md:text-4xl">
              Design your own day
            </h2>
            <p className="text-lg text-muted-foreground">
              Nothing above quite fit? We build private itineraries from scratch — half a day
              in the Prosecco hills, a long day in the Dolomites, or several days across the
              Veneto. Rates are per group, not per person.
            </p>
          </div>

          <dl className="divide-y divide-border border-y border-border">
            {PRIVATE_TOUR_RATES.map((rate) => (
              <div key={rate.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt>
                  <span className="font-medium">{rate.label}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{rate.detail}</span>
                </dt>
                <dd className="shrink-0 text-lg font-bold">{rate.price}</dd>
              </div>
            ))}
          </dl>

          <p className="text-sm text-muted-foreground">
            Extras such as entrance fees and tastings are paid directly to the venue on the
            day.
          </p>

          <Button asChild size="lg" className="bg-primary-strong hover:bg-primary-strong/90">
            <Link href="/contact">Ask for a quote</Link>
          </Button>
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <InclusionList tone="included" heading="Included" items={PRIVATE_TOUR_INCLUDED} />
          <InclusionList
            tone="excluded"
            heading="Not included"
            items={PRIVATE_TOUR_NOT_INCLUDED}
          />
        </div>
      </div>
    </section>
  );
}

function InclusionList({
  tone,
  heading,
  items,
}: {
  tone: "included" | "excluded";
  heading: string;
  items: readonly string[];
}) {
  const Icon = tone === "included" ? Check : X;
  const iconColor = tone === "included" ? "text-primary-strong" : "text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3
        className={`mb-3 text-sm font-semibold uppercase tracking-wide ${
          tone === "included" ? "text-primary-strong" : "text-muted-foreground"
        }`}
      >
        {heading}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <Icon className={`mt-0.5 size-4 shrink-0 ${iconColor}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
