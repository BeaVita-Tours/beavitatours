import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronRight } from "lucide-react";

import { BookingPanel } from "@/components/tours/booking-panel";
import { PriceDisplay } from "@/components/tours/price-display";
import { RatingStars } from "@/components/tours/rating-stars";
import {
  TourBadges,
  TourHighlights,
  TourInclusions,
  TourMeetingPoint,
  TourProse,
} from "@/components/tours/tour-facts";
import { TourGallery } from "@/components/tours/tour-gallery";
import { TourGrid } from "@/components/tours/tour-grid";
import { TourReviews } from "@/components/tours/tour-reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_URL } from "@/lib/constants";
import { getConfig, isNativeBookingEnabled } from "@/lib/regiondo/config";
import {
  getAvailability,
  getOptions,
  getRelatedTours,
  getTourBySlug,
  getTourReviews,
} from "@/lib/regiondo/products";
import { pickTrackedParams } from "@/lib/regiondo/session";
import { productIdForSlug, TOUR_SLUGS } from "@/lib/regiondo/slugs";
import {
  breadcrumbJsonLd,
  jsonLdScriptProps,
  tourJsonLd,
} from "@/lib/regiondo/structured-data";
import { truncate } from "@/lib/regiondo/sanitize";
import type { TourDetail } from "@/lib/regiondo/types";

/**
 * Tour detail page.
 *
 * Layout (client brief): photo on the left, a box with the essentials and
 * the booking CTA on the right; beneath them the key-fact badges, then a
 * short description, then a few other tours. The long-form sections —
 * highlights, inclusions, meeting point, reviews — follow after that for the
 * reader who wants them, but they are no longer what the page leads with.
 *
 * Structure follows from Cache Components: everything above the fold — title,
 * price, gallery, key facts, the description — is cached catalog data and
 * lands in the prerendered shell. The booking panel is the only part that
 * depends on live inventory, so it is the only part inside a Suspense boundary.
 * A visitor sees the whole page immediately and the calendar fills in.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Prerender every curated tour.
 *
 * The params come from the slug registry rather than from the API, for three
 * reasons: it is the canonical set of URLs we intend to have indexed; the build
 * does not then depend on Regiondo being reachable; and Cache Components
 * requires this to return at least one entry, which a live call cannot promise.
 *
 * A product added in Regiondo since the last deploy is not listed here and is
 * rendered on demand at `/tours/p-<id>`.
 */
export function generateStaticParams() {
  return Object.keys(TOUR_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) return { title: "Tour not found" };

  // Regiondo's meta_title already carries the brand ("Bea Vita Tours | ..."),
  // so it is used verbatim where present rather than re-appending the suffix.
  const title = tour.metaTitle || `${tour.title} | Bea Vita Tours`;
  const description = truncate(tour.metaDescription || tour.excerpt, 155);
  const image = tour.gallery[0]?.url ?? tour.image?.url;

  return {
    title,
    description,
    alternates: { canonical: tour.href },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}${tour.href}`,
      siteName: "Bea Vita Tours",
      ...(image ? { images: [{ url: image, width: 600, height: 400, alt: tour.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function TourPage({ params, searchParams }: PageProps) {
  const { slug } = await params;

  // With the flag off the route does not exist, so the site behaves exactly as
  // it does today and there is nothing half-built for a crawler to find.
  if (!isNativeBookingEnabled()) notFound();
  if (!productIdForSlug(slug)) notFound();

  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const reviews = await getTourReviews(tour.id);
  const related = await getRelatedTours(tour.id, tour.collections[0] ?? null);

  const trail = [
    { name: "Home", href: "/" },
    { name: "Tours", href: "/tours" },
    { name: tour.title, href: tour.href },
  ];

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <script {...jsonLdScriptProps([tourJsonLd(tour, reviews), breadcrumbJsonLd(trail)])} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {trail.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
              {index === trail.length - 1 ? (
                <span aria-current="page" className="truncate text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Image left, essentials + CTA right. Stacks on mobile: photo, then
          the box — the booking panel sits inline under the title there. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        <TourGallery images={tour.gallery} title={tour.title} layout="stacked" />

        <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
          <header className="space-y-3">
            {tour.collections[0] ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-strong">
                {tour.collections[0]}
              </p>
            ) : null}
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{tour.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {tour.rating ? <RatingStars rating={tour.rating} size="md" /> : null}
              {tour.city ? <span>{tour.city}</span> : null}
              {tour.duration ? <span>{tour.duration.label}</span> : null}
            </div>
          </header>

          <div className="border-t pt-5">
            <h2 className="sr-only">Book this tour</h2>
            <Suspense fallback={<BookingPanelFallback tour={tour} />}>
              <LiveBookingPanel tour={tour} searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Badges: the key facts as one row of pills. */}
      <div className="mt-6">
        <TourBadges tour={tour} />
      </div>

      {/* Short description: the excerpt, large, then the full copy under it. */}
      <section aria-labelledby="about-heading" className="mt-10 max-w-3xl space-y-4">
        <h2 id="about-heading" className="text-2xl font-bold">
          About this tour
        </h2>
        {tour.excerpt ? (
          <p className="text-lg leading-relaxed text-foreground/85">{tour.excerpt}</p>
        ) : null}
        <div
          className="prose prose-blog max-w-none text-sm leading-relaxed"
          // Sanitised in lib/regiondo/sanitize.ts against a narrow allowlist:
          // no script, no iframe, no event handlers, no inline styles.
          dangerouslySetInnerHTML={{ __html: tour.descriptionHtml }}
        />
      </section>

      {/* A few other tours, before the long-form details. */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-14 space-y-6">
          <h2 id="related-heading" className="text-2xl font-bold">
            You might also like
          </h2>
          <TourGrid tours={related} priorityCount={0} headingId="related-heading" />
        </section>
      ) : null}

      {/* Everything else a booker may want to check. */}
      <div className="mt-16 max-w-3xl space-y-10 border-t pt-12">
        <TourHighlights highlights={tour.highlights} />
        <TourInclusions tour={tour} />
        <TourProse id="bring" heading="What to bring" html={tour.bringHtml} />
        <TourMeetingPoint tour={tour} />
        <TourProse id="good-to-know" heading="Good to know" html={tour.otherInfoHtml} />
        <TourProse id="important" heading="Important information" html={tour.importantInfoHtml} />
        <TourReviews reviews={reviews} rating={tour.rating} />
      </div>
    </main>
  );
}

/**
 * Live half of the page. Availability and seat counts are never cached, so this
 * component is uncached by construction and streams in behind Suspense — it
 * cannot hold up the static shell.
 */
async function LiveBookingPanel({
  tour,
  searchParams,
}: {
  tour: TourDetail;
  searchParams: PageProps["searchParams"];
}) {
  // Everything below depends on "now" and on live stock, neither of which can
  // be baked into a prerender. Cache Components rejects `new Date()` in the
  // static shell for exactly that reason; `connection()` says "this part waits
  // for a real request", which is what puts it behind the Suspense boundary
  // instead of blocking the build.
  await connection();

  const variation = tour.variations[0];
  if (!variation) {
    return <p className="text-sm text-muted-foreground">This tour is not bookable online.</p>;
  }

  const today = new Date();
  const from = toDateKey(addDays(today, Math.ceil(tour.bookingNoticeHours / 24)));
  // Three months covers the overwhelming majority of bookings; the panel can
  // fetch further out on demand.
  const to = toDateKey(addDays(today, 100));

  const availability = await getAvailability(variation.id, from, to);
  const firstDate = Object.keys(availability).sort()[0] ?? null;
  const firstTime = firstDate ? (availability[firstDate]?.[0] ?? null) : null;

  const options =
    firstDate && firstTime ? await getOptions(variation.id, firstDate, firstTime) : [];

  if (Object.keys(availability).length === 0) {
    return (
      <div className="space-y-3">
        <PriceDisplay price={tour.priceFrom} showFrom size="lg" unit="per person" />
        <p className="text-sm text-muted-foreground">
          No dates are open for online booking at the moment.
        </p>
        <Link
          href="/contact"
          className="inline-flex text-sm font-medium text-primary-strong underline-offset-4 hover:underline"
        >
          Ask us about a private departure
        </Link>
      </div>
    );
  }

  const resolved = await searchParams;

  return (
    <BookingPanel
      slug={tour.slug}
      variations={tour.variations}
      availability={availability}
      initialOptions={options}
      initialDate={firstDate}
      initialTime={firstTime}
      currency={getConfig().currency}
      bookingNoticeHours={tour.bookingNoticeHours}
      utm={pickTrackedParams(resolved)}
    />
  );
}

/**
 * The fallback shows the real starting price from cached catalog data, so the
 * most important number on the page is in the static HTML even while live
 * availability is still loading.
 */
function BookingPanelFallback({ tour }: { tour: TourDetail }) {
  return (
    <div className="space-y-5">
      <PriceDisplay price={tour.priceFrom} showFrom size="lg" unit="per person" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-11 w-full" />
      <p className="text-center text-xs text-muted-foreground">Checking live availability…</p>
    </div>
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + Math.max(0, days));
  return next;
}

function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
