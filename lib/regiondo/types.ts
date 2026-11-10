/**
 * Domain types. Deliberately NOT `server-only`: these are plain data shapes and
 * client islands (the date picker, the price calculator) need to import them.
 * Nothing here carries credentials — the modules that do are all server-only.
 */

/** HTML that has already been through `sanitizeHtml`. */
export type SafeHtml = string & { readonly __safeHtml: unique symbol };

export interface TourImage {
  readonly url: string;
  readonly thumbnailUrl: string;
  readonly alt: string;
}

export interface TourPrice {
  /** What the customer pays, in major units. */
  readonly amount: number;
  /** Strike-through price when there is a genuine discount, else null. */
  readonly wasAmount: number | null;
  readonly currency: string;
}

export interface TourRating {
  /** 0–5, one decimal. */
  readonly value: number;
  readonly count: number;
}

export interface TourDuration {
  readonly value: number;
  readonly unit: "hour" | "day" | "minute";
  /** Pre-formatted for display, e.g. "9 hours". */
  readonly label: string;
}

/** The shape a card needs. Cheap to fetch in bulk, safe to cache. */
export interface TourSummary {
  readonly id: string;
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly excerpt: string;
  readonly image: TourImage | null;
  readonly priceFrom: TourPrice;
  readonly rating: TourRating | null;
  readonly duration: TourDuration | null;
  readonly city: string | null;
  readonly languages: readonly string[];
  readonly collections: readonly string[];
  readonly needsAppointment: boolean;
  readonly updatedAt: string | null;
}

export interface TourVariation {
  readonly id: string;
  readonly name: string;
  readonly appointmentType: string | null;
  readonly from: string | null;
  readonly to: string | null;
}

/** Everything the detail page renders. Safe to cache; carries no live stock. */
export interface TourDetail extends TourSummary {
  readonly descriptionHtml: SafeHtml;
  readonly highlights: readonly string[];
  readonly includedHtml: SafeHtml | null;
  readonly notIncludedHtml: SafeHtml | null;
  readonly bringHtml: SafeHtml | null;
  readonly otherInfoHtml: SafeHtml | null;
  readonly importantInfoHtml: SafeHtml | null;
  readonly participantsHtml: SafeHtml | null;
  readonly gallery: readonly TourImage[];
  readonly variations: readonly TourVariation[];
  readonly meetingPoint: {
    readonly name: string | null;
    readonly address: string | null;
    readonly info: string | null;
    readonly lat: number | null;
    readonly lon: number | null;
  };
  readonly timezone: string;
  /** Hours of lead time the supplier needs before departure. */
  readonly bookingNoticeHours: number;
  readonly provider: string | null;
  readonly metaTitle: string | null;
  readonly metaDescription: string | null;
  readonly createdAt: string | null;
}

/**
 * A bookable participant tier at a specific date and time. Always fetched live
 * — `seatsLeft` is real inventory and must never come from a cache.
 */
export interface TourOption {
  readonly id: string;
  readonly variationId: string;
  readonly name: string;
  readonly description: string;
  readonly price: TourPrice;
  readonly minPerOrder: number;
  /** 0 means "no per-order cap", which is how the API expresses it. */
  readonly maxPerOrder: number;
  readonly seatsLeft: number | null;
  readonly sortOrder: number;
}

/** date (YYYY-MM-DD) -> available start times (HH:MM:SS). */
export type TourAvailability = Readonly<Record<string, readonly string[]>>;

/**
 * One departure as the booking panel sees it: its tiers, and the number of
 * places the departure has left across all of them. Every option's
 * `seatsLeft` is already capped at that shared number, so a single tier can
 * never offer more than the coach holds; `seatsLeft` here is what caps the
 * party as a whole. Null when the API did not say.
 */
export interface TourSlot {
  readonly options: readonly TourOption[];
  readonly seatsLeft: number | null;
}

export interface TourReview {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly createdAt: string | null;
  /** 1–5, from the "Overall rating" vote. */
  readonly rating: number | null;
  readonly response: string | null;
}

export interface TourCollection {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly href: string;
}

/* -------------------------------------------------------------------------- */
/* checkout                                                                   */
/* -------------------------------------------------------------------------- */

export interface BookingLineItem {
  readonly productId: string;
  readonly optionId: string;
  /** "YYYY-MM-DD HH:MM", the format the Checkout API expects. */
  readonly dateTime: string;
  readonly qty: number;
}

/** A form field the checkout must render, as the API defines it. */
export interface CheckoutField {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  /** Widget: text, select, date, … */
  readonly type: string;
  /** Semantics: email, phone, first_name, … Drives autocomplete + input type. */
  readonly viewType: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
}

export interface CheckoutTotalsView {
  readonly subtotal: number;
  readonly grandTotal: number;
  readonly currency: string;
  readonly taxAmount: number | null;
}

export interface HeldReservation {
  readonly code: string;
  /** ISO instant the hold lapses, or null when the API did not say. */
  readonly expiresAt: string | null;
  readonly totals: CheckoutTotalsView | null;
  /**
   * The checkout form, deduplicated. The API describes the same four fields
   * twice (`contact_data_required` and `buyer_data_required`); `mergeFields` in
   * checkout.ts collapses them, so this is what should actually be rendered.
   */
  readonly fields: readonly CheckoutField[];
}

export interface ConfirmedBookingItem {
  readonly productId: string;
  readonly productName: string;
  readonly optionName: string;
  readonly variationName: string;
  readonly eventDateTime: string | null;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
  readonly statusLabel: string;
}

/**
 * A verified order, narrowed to what the confirmation page renders.
 *
 * Deliberately does not carry ticket PDF links or full contact details. The
 * page is reachable with an order number alone, so it must not expose anything
 * that an order number should not unlock — the tickets go by email.
 */
export interface ConfirmedBooking {
  readonly orderNumber: string;
  readonly purchasedAt: string | null;
  readonly items: readonly ConfirmedBookingItem[];
  readonly total: number;
  readonly taxAmount: number;
  readonly currency: string;
  readonly paymentStatusLabel: string;
  readonly salesChannel: string;
  /** Masked for display — never the full address. */
  readonly maskedEmail: string;
}
