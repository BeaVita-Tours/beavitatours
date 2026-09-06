import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/tours/checkout-form";
import { PriceDisplay } from "@/components/tours/price-display";
import { Button } from "@/components/ui/button";
import { getTotals } from "@/lib/regiondo/checkout";
import { getConfig, isNativeBookingEnabled } from "@/lib/regiondo/config";
import { isRegiondoError, userMessageFor } from "@/lib/regiondo/errors";
import { getTour } from "@/lib/regiondo/products";
import { getBookingSessionFor } from "@/lib/regiondo/session";
import { tourHref } from "@/lib/regiondo/slugs";

/**
 * Checkout.
 *
 * Reachable only with a valid, signed booking-session cookie that matches the
 * reservation code in the URL. The code alone grants nothing — reservations are
 * account-global on this API, so a pasted code must not be a way into someone
 * else's checkout.
 *
 * Everything on this page comes from the server: the tour from cached catalog
 * data, the total recomputed from Regiondo, the form fields from the hold
 * response. Nothing about price or product is read from the request.
 */

export const metadata: Metadata = {
  title: "Complete your booking",
  robots: { index: false, follow: false },
};

/**
 * A blocking route, not a streamed one.
 *
 * Every part of this page depends on who is asking — the signed session cookie,
 * the reservation code, and a live totals call. There is no meaningful static
 * shell to prerender, and streaming a skeleton of a checkout is worse than
 * waiting a beat for the real thing. `instant = false` is this repo's opt-out
 * under Cache Components (the same idiom the blog routes use); `dynamic` and
 * `revalidate` are rejected.
 */
export const instant = false;


interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  if (!isNativeBookingEnabled()) notFound();

  const { code } = await params;
  const session = await getBookingSessionFor(decodeURIComponent(code));

  // No session, or a session for a different reservation. Not a 404 — the
  // likeliest cause by far is a hold that lapsed while the tab sat open, and
  // "start again" is a far better answer than "page not found".
  if (!session) return <ExpiredNotice />;

  const tour = await getTour(session.item.productId);
  if (!tour) return <ExpiredNotice />;

  let totals: Awaited<ReturnType<typeof getTotals>>;
  try {
    totals = await getTotals([session.item], { reservationCode: session.code });
  } catch (error) {
    // A reservation that has already lapsed upstream lands here, as does a
    // Regiondo outage. Both get a way forward rather than a stack trace.
    return (
      <RecoveryNotice
        href={tourHref(session.item.productId)}
        message={userMessageFor(error)}
        expired={isRegiondoError(error) && error.kind === "reservation_expired"}
      />
    );
  }

  const currency = totals.currency || getConfig().currency;
  const [date, time] = session.item.dateTime.split(" ");

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
      <h1 className="mb-8 text-3xl font-bold md:text-4xl">Complete your booking</h1>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div className="min-w-0">
          <CheckoutForm
            code={session.code}
            fields={totals.fields}
            expiresAt={session.expiresAt}
            expectedTotal={totals.grandTotal}
            currency={currency}
            tourHref={tourHref(session.item.productId)}
            analyticsItem={{
              item_id: tour.id,
              item_name: tour.title,
              item_category: tour.collections[0],
              price: totals.grandTotal / Math.max(1, session.item.qty),
              quantity: session.item.qty,
            }}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your booking
            </h2>

            <div>
              <p className="font-semibold leading-snug">{tour.title}</p>
              {tour.meetingPoint.name ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Departs from {tour.meetingPoint.name}
                </p>
              ) : null}
            </div>

            <dl className="space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Date">{formatDate(date)}</Row>
              <Row label="Time">{time?.slice(0, 5) ?? "—"}</Row>
              <Row label="Guests">{session.item.qty}</Row>
              {totals.taxAmount !== null ? (
                <Row label="Includes tax">
                  {new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency,
                  }).format(totals.taxAmount)}
                </Row>
              ) : null}
            </dl>

            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <PriceDisplay
                price={{ amount: totals.grandTotal, wasAmount: null, currency }}
                size="md"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Free cancellation and any booking conditions are confirmed on the payment page
              before you pay.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function ExpiredNotice() {
  return (
    <RecoveryNotice
      href="/tours"
      expired
      message="Your reservation has expired and the places were released back to the calendar."
    />
  );
}

function RecoveryNotice({
  href,
  message,
  expired,
}: {
  href: string;
  message: string;
  expired: boolean;
}) {
  return (
    <main className="container mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">
        {expired ? "That reservation has expired" : "We could not load your booking"}
      </h1>
      <p className="mt-3 text-muted-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Nothing has been charged. Choosing a date again takes a few seconds.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={href}>Choose a date</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Ask us to book it</Link>
        </Button>
      </div>
    </main>
  );
}

function formatDate(key?: string): string {
  if (!key) return "—";
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
