import Image from "next/image";
import Link from "next/link";
import { Check, Star, X } from "lucide-react";

import { OTAWordmark } from "@/components/ota-wordmark";
import { Button } from "@/components/ui/button";
import {
  PRIVATE_TOUR_FORMATS,
  PRIVATE_TOUR_INCLUDED,
  PRIVATE_TOUR_NOT_INCLUDED,
  PRIVATE_TOUR_PHOTOS,
  PRIVATE_TOUR_STARTING_PRICE,
} from "@/lib/private-tours";
import { manualReviews } from "@/lib/reviews/manual-reviews";
import { headlineStats } from "@/lib/reviews/platform-stats";

/**
 * The tailor-made offer, under the private catalog.
 *
 * Someone who has scrolled the private departures and not found their day is
 * exactly the person this is for, so it sits below the grid rather than above
 * it. It replaced the old `/rates` page, and since then it has also lost the
 * rate card (client decision): photos, proof and a single "from €900" hook,
 * then the contact form does the rest.
 */
export function PrivateTourRates() {
  const [lead, ...rest] = PRIVATE_TOUR_PHOTOS;
  // Two short quotes as social proof. Drawn from the manual reviews so they
  // are real and stay in sync with the homepage; picked by length so they
  // fit the panel without a "read more".
  const quotes = manualReviews
    .filter((r) => r.rating >= 4 && r.text.length > 0 && r.text.length <= 220)
    .slice(0, 2);

  return (
    <section aria-labelledby="tailor-made-heading" className="space-y-10">
      {/* Photos + the pitch */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        {/* Photo mosaic: one lead image, three beneath. */}
        <figure className="space-y-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-muted md:aspect-3/2">
            <Image
              src={lead!.src}
              alt={lead!.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              quality={75}
              className="object-cover"
            />
          </div>
          {rest.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {rest.map((photo) => (
                <div
                  key={photo.src}
                  className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 18vw, 33vw"
                    quality={70}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </figure>

        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
              Tailor-made
            </p>
            <h2 id="tailor-made-heading" className="text-3xl font-bold md:text-4xl">
              Design your own day
            </h2>
            <p className="text-lg text-muted-foreground">
              Your own driver-guide, your own vehicle, your own pace. We build private
              itineraries from scratch — half a day in the Prosecco hills, a long day in the
              Dolomites, or several days across the Veneto.
            </p>
          </div>

          {/* The one number on the page. Per group, not per person. */}
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Full day, private, per group
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">Starting from</span>
              <span className="text-4xl font-bold text-foreground">
                {PRIVATE_TOUR_STARTING_PRICE}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Half days, multi-day trips and anything unusual are quoted for your group —
              tell us what you have in mind and we reply within a day.
            </p>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {PRIVATE_TOUR_FORMATS.map((format) => (
              <li key={format.label} className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold">{format.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{format.detail}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="bg-primary-strong hover:bg-primary-strong/90">
              <Link href="/contact">Ask for a quote</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              No deposit to ask. Free cancellation up to 48h before.
            </p>
          </div>
        </div>
      </div>

      {/* Proof: platform ratings + two real quotes. */}
      <div className="rounded-3xl border border-border bg-muted/40 p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
              Rated by thousands of guests
            </p>
            <ul className="space-y-3">
              {headlineStats.map((stat) => (
                <li key={stat.platform} className="flex items-center gap-3">
                  <OTAWordmark ota={stat.platform} height={18} />
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-semibold tabular-nums">{stat.rating}</span>
                    {stat.count ? (
                      <span className="text-muted-foreground">
                        ({stat.count.toLocaleString("en-US")}+)
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {quotes.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {quotes.map((review) => (
                <li key={review.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        aria-hidden="true"
                        className={
                          star <= Math.round(review.rating)
                            ? "size-4 fill-amber-400 text-amber-400"
                            : "size-4 text-border"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {review.authorName}
                    {review.platformLabel ? ` · ${review.platformLabel}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* What is and isn't in the price. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InclusionList tone="included" heading="Included" items={PRIVATE_TOUR_INCLUDED} />
        <InclusionList
          tone="excluded"
          heading="Not included"
          items={PRIVATE_TOUR_NOT_INCLUDED}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Extras such as entrance fees and tastings are paid directly to the venue on the day.
      </p>
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
