import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Mail, MapPin, Ticket, Users } from "lucide-react";

import { PurchaseTracker } from "@/components/tours/purchase-tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findBookingByOrderNumber } from "@/lib/regiondo/checkout";
import { isNativeBookingEnabled } from "@/lib/regiondo/config";
import { getTour } from "@/lib/regiondo/products";
import { tourHref } from "@/lib/regiondo/slugs";
import type { ConfirmedBookingItem } from "@/lib/regiondo/types";

/**
 * Booking confirmation.
 *
 * The order is verified against Regiondo before anything is rendered or fired.
 * Order details never come from the URL — the query string supplies an order
 * number to look up, and an unknown one produces the lookup form rather than a
 * fabricated confirmation.
 *
 * **On being reached at all:** `GET /checkout/checkoutlink` accepts no return
 * URL (the link is path-based with no query string at all), so Regiondo does
 * not send the customer back here automatically unless a return URL is
 * configured in the ticketshop settings. Until that is done, this page is
 * reached through the "find my booking" form below and from the confirmation
 * email. A documented gap, not an oversight — see D-008 in
 * docs/regiondo-build-log.md and the cutover checklist.
 */

export const metadata: Metadata = {
  title: "Your booking is confirmed",
  robots: { index: false, follow: false },
};

/**
 * Blocking, for the same reason as the checkout page: the order lookup is the
 * page. Rendering a shell before knowing whether the order exists would mean
 * showing a confirmation layout to someone who has not booked anything.
 */
export const instant = false;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  if (!isNativeBookingEnabled()) notFound();

  const resolved = await searchParams;
  const raw = resolved.order ?? resolved.order_number ?? resolved.ordernumber;
  const orderNumber = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  if (!orderNumber) return <LookupForm />;

  // The single source of truth. If Regiondo does not know this order, there is
  // no order, whatever the URL says.
  const booking = await findBookingByOrderNumber(orderNumber);
  if (!booking) return <LookupForm notFoundNumber={orderNumber} />;

  const lead = booking.items[0];
  // The meeting point and "what to bring" come from the catalog, which the
  // order itself does not carry.
  const tour = lead ? await getTour(lead.productId) : null;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <PurchaseTracker
        payload={{
          transaction_id: booking.orderNumber,
          currency: booking.currency,
          value: booking.total,
          items: booking.items.map((item) => ({
            item_id: item.productId,
            item_name: item.productName,
            item_category: item.optionName || undefined,
            price: item.unitPrice,
            quantity: item.quantity,
          })),
        }}
      />

      <div className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary-strong" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">You are booked</h1>
        <p className="mt-2 text-muted-foreground">
          Order <span className="font-semibold text-foreground">{booking.orderNumber}</span>
          {booking.paymentStatusLabel ? ` · ${booking.paymentStatusLabel}` : ""}
        </p>
      </div>

      <section aria-labelledby="details-heading" className="mt-10 space-y-4">
        <h2 id="details-heading" className="sr-only">
          Booking details
        </h2>

        {booking.items.map((item) => (
          <BookingItemCard key={`${item.productId}-${item.eventDateTime}`} item={item} />
        ))}

        <div className="rounded-2xl border bg-card p-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Fact icon={Ticket} label="Total paid">
              {formatMoney(booking.total, booking.currency)}
              {booking.taxAmount > 0 ? (
                <span className="block text-xs text-muted-foreground">
                  Includes {formatMoney(booking.taxAmount, booking.currency)} tax
                </span>
              ) : null}
            </Fact>

            <Fact icon={Mail} label="Tickets sent to">
              {booking.maskedEmail || "the email address you gave at checkout"}
            </Fact>

            {tour?.meetingPoint.name ? (
              <Fact icon={MapPin} label="Meeting point" wide>
                {tour.meetingPoint.name}
                {tour.meetingPoint.address ? (
                  <span className="block text-xs text-muted-foreground">
                    {tour.meetingPoint.address}
                  </span>
                ) : null}
                {tour.meetingPoint.info ? (
                  <span className="mt-1 block text-sm font-normal">{tour.meetingPoint.info}</span>
                ) : null}
              </Fact>
            ) : null}
          </dl>
        </div>
      </section>

      {tour?.bringHtml ? (
        <section aria-labelledby="bring-heading" className="mt-8">
          <h2 id="bring-heading" className="text-xl font-bold">
            What to bring
          </h2>
          <div
            className="prose prose-blog mt-3 max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: tour.bringHtml }}
          />
        </section>
      ) : null}

      <section aria-labelledby="next-heading" className="mt-8 rounded-2xl bg-muted/40 p-6">
        <h2 id="next-heading" className="text-xl font-bold">
          What happens next
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            Your tickets and a full confirmation are on their way by email from Regiondo, our
            booking provider. Check your spam folder if they have not arrived within an hour.
          </li>
          <li>
            Please be at the meeting point 15 minutes before departure. Tours leave punctually.
          </li>
          <li>
            Cancellation terms are set out in your confirmation email. If anything changes, tell us
            as early as you can and we will do what we can.
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          {lead ? (
            <Button asChild variant="outline">
              <Link href={tourHref(lead.productId)}>View the tour</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function BookingItemCard({ item }: { item: ConfirmedBookingItem }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="text-xl font-bold">{item.productName}</h3>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <Fact icon={CalendarDays} label="Date and time">
          {formatEventDateTime(item.eventDateTime)}
        </Fact>

        <Fact icon={Users} label="Guests">
          {item.quantity} × {item.optionName || item.variationName || "place"}
        </Fact>
      </dl>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
  wide,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

/**
 * "Find my booking".
 *
 * A plain GET form: it sets `?order=` and the page verifies it server-side, so
 * the recovery path is the same code path as the happy one. This is also how
 * the page is reached at all while there is no ticketshop return URL.
 */
function LookupForm({ notFoundNumber }: { notFoundNumber?: string }) {
  return (
    <main className="container mx-auto max-w-md px-4 py-20">
      <h1 className="text-3xl font-bold">Find your booking</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter the order number from your confirmation email and we will pull up the details.
      </p>

      {notFoundNumber ? (
        <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          We could not find an order matching that number. Please check it against your
          confirmation email — or get in touch and we will look it up for you.
        </p>
      ) : null}

      <form method="get" className="mt-6 space-y-3">
        <Label htmlFor="order">Order number</Label>
        <Input
          id="order"
          name="order"
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder="2001794609406"
          defaultValue={notFoundNumber ?? ""}
        />
        <Button type="submit" className="w-full">
          Find my booking
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Still stuck?{" "}
        <Link
          href="/contact"
          className="font-medium text-primary-strong underline-offset-4 hover:underline"
        >
          Contact us
        </Link>{" "}
        and we will sort it out.
      </p>
    </main>
  );
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

/** Regiondo returns "2026-09-22 09:00" in the booking's own time zone. */
function formatEventDateTime(raw: string | null): string {
  if (!raw) return "To be confirmed";
  const [date, time] = raw.split(" ");
  const [year, month, day] = (date ?? "").split("-").map(Number);
  if (!year) return raw;

  const formatted = new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return time ? `${formatted} at ${time.slice(0, 5)}` : formatted;
}
