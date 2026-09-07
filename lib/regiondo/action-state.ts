/**
 * Shared state shape for the booking Server Actions.
 *
 * This lives outside `app/(site)/book/actions.ts` because a `"use server"`
 * module may export **async functions only** — exporting the `IDLE` constant
 * from there fails at module evaluation with "A 'use server' file can only
 * export async functions, found object", which surfaces as a 500 the first time
 * a form is submitted rather than at build time.
 *
 * Types are erased and would have been fine; the value is what breaks it.
 */

export interface ActionState {
  readonly status: "idle" | "error";
  readonly message?: string;
  /** Field-level messages keyed by field name, for inline form errors. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
  /** Set when the failure means availability has to be re-checked. */
  readonly recheckAvailability?: boolean;
}

export const IDLE: ActionState = { status: "idle" };
