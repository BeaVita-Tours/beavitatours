/**
 * Shared state shape for the booking Server Action.
 *
 * This lives outside `app/(site)/book/actions.ts` because a `"use server"`
 * module may export **async functions only** — exporting the `IDLE` constant
 * from there fails at module evaluation with "A 'use server' file can only
 * export async functions, found object", which surfaces as a 500 the first time
 * a form is submitted rather than at build time.
 *
 * Types are erased and would have been fine; the value is what breaks it.
 */

export type ActionState =
  | { readonly status: "idle" }
  | {
      readonly status: "error";
      readonly message: string;
      /** Set when the failure means availability has to be re-checked. */
      readonly recheckAvailability?: boolean;
    }
  | {
      /**
       * The hold is placed and Regiondo's hosted checkout is ready. The client
       * navigates there itself (rather than the action redirecting) so it can
       * fire the payment-handoff event first — a server redirect leaves the
       * page before any script runs.
       */
      readonly status: "handoff";
      readonly checkoutUrl: string;
    };

export const IDLE: ActionState = { status: "idle" };
