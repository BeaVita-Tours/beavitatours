"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { proceedToPayment } from "@/app/(site)/book/actions";
import { IDLE } from "@/lib/regiondo/action-state";
import { HoldCountdown } from "@/components/tours/hold-countdown";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackBeginCheckout, trackPaymentHandoff } from "@/lib/analytics";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import type { CheckoutField } from "@/lib/regiondo/types";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  code: string;
  /** Field definitions from the API, not a hardcoded list. */
  fields: readonly CheckoutField[];
  expiresAt: string;
  expectedTotal: number;
  currency: string;
  tourHref: string;
  /** For the begin_checkout / add_payment_info events. */
  analyticsItem: {
    item_id: string;
    item_name: string;
    item_category?: string;
    price: number;
    quantity: number;
  };
}

/**
 * The checkout form.
 *
 * The fields are whatever `POST /checkout/hold` said were required — first
 * name, last name, email and phone today, but a product that starts asking for
 * a date of birth will render one without a code change. Nothing here is
 * hardcoded except the mapping from `view_type` to input semantics.
 *
 * What this form does **not** do is take payment. Submitting recomputes the
 * total server-side and redirects to Regiondo's hosted ticketshop, which is
 * where card details are entered. That is a compliance boundary, not a design
 * choice — see D-001.
 */
export function CheckoutForm({
  code,
  fields,
  expiresAt,
  expectedTotal,
  currency,
  tourHref,
  analyticsItem,
}: CheckoutFormProps) {
  const [state, formAction, submitting] = useActionState(proceedToPayment, IDLE);
  const [expired, setExpired] = useState(false);
  const { hasAnalyticsConsent, hydrated } = useCookieConsent();

  useEffect(() => {
    if (!hydrated) return;
    trackBeginCheckout(
      { currency, value: expectedTotal, items: [analyticsItem] },
      hasAnalyticsConsent
    );
    // Once per mounted checkout. Re-firing on every consent flip would
    // inflate the funnel.
  }, [hydrated, hasAnalyticsConsent, currency, expectedTotal, analyticsItem]);

  const recheck = expired || state.recheckAvailability;

  return (
    <form
      action={formAction}
      onSubmit={() => {
        trackPaymentHandoff(
          { currency, value: expectedTotal, items: [analyticsItem] },
          hasAnalyticsConsent
        );
      }}
      className="space-y-6"
    >
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="expectedTotal" value={expectedTotal} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Your details</h2>
        <HoldCountdown expiresAt={expiresAt} onExpired={() => setExpired(true)} />
      </div>

      {recheck ? (
        <div role="alert" className="space-y-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="flex items-start gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {state.message ??
                "Your reservation timed out and the places were released. Nothing you typed has been lost — pick a date again and we will bring it through."}
            </span>
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={tourHref}>Back to the tour and re-check dates</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <CheckoutFieldInput
            key={field.id}
            field={field}
            error={state.fieldErrors?.[fieldName(field)]}
          />
        ))}
      </div>

      {/*
        Honeypot. Same approach as lib/travel-agency.ts: a real field name a bot
        will fill, hidden from people and from assistive technology.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && !recheck ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={submitting || expired}>
        {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Continue to secure payment
        <ArrowRight aria-hidden="true" />
      </Button>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Payment is handled by Regiondo, our booking provider. Your card details are entered on
          their secure page and never reach this website.
        </span>
      </p>
    </form>
  );
}

/**
 * One field, rendered from the API's own definition.
 *
 * `view_type` is the semantic hint — it decides the input type, the
 * autocomplete token and the keyboard a phone shows. `type` is the widget.
 */
function CheckoutFieldInput({ field, error }: { field: CheckoutField; error?: string }) {
  const name = fieldName(field);
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : undefined;

  const wide = field.viewType === "comment" || field.type === "textarea";

  return (
    <div className={cn("space-y-1.5", wide && "sm:col-span-2")}>
      <Label htmlFor={id}>
        {field.label}
        {field.required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {field.required ? <span className="sr-only"> (required)</span> : null}
      </Label>

      {wide ? (
        <Textarea
          id={id}
          name={name}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          rows={3}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={inputType(field.viewType)}
          inputMode={field.viewType === "phone" ? "tel" : undefined}
          autoComplete={autoCompleteFor(field.viewType)}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}

      {/* Reserved height so an error appearing does not shift the layout. */}
      <p id={`${id}-error`} className="min-h-5 text-xs text-destructive">
        {error ?? ""}
      </p>
    </div>
  );
}

/**
 * The server action validates against `firstname` / `lastname` / `email` /
 * `telephone`, so the field's semantic type decides the input name. A field the
 * API adds later falls back to its own id and is carried through unvalidated
 * rather than silently dropped.
 */
function fieldName(field: CheckoutField): string {
  switch (field.viewType) {
    case "first_name":
      return "firstname";
    case "last_name":
      return "lastname";
    case "email":
      return "email";
    case "phone":
      return "telephone";
    case "comment":
      return "comment";
    default:
      return field.id;
  }
}

function inputType(viewType: string): string {
  if (viewType === "email") return "email";
  if (viewType === "phone") return "tel";
  if (viewType === "birthdate") return "date";
  return "text";
}

function autoCompleteFor(viewType: string): string | undefined {
  switch (viewType) {
    case "first_name":
      return "given-name";
    case "last_name":
      return "family-name";
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "street":
      return "street-address";
    case "postcode":
      return "postal-code";
    case "city":
      return "address-level2";
    case "country":
      return "country-name";
    default:
      return undefined;
  }
}
