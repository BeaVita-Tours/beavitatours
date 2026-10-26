"use client";

import { useSearchParams } from "next/navigation";
import { Flag } from "lucide-react";

/**
 * Shown at the top of the contact page when it was reached from the footer's
 * "Report a review or photo" link (`/contact?subject=report`). Tells the
 * visitor what to include so a takedown request can be acted on quickly.
 *
 * Reads `useSearchParams`, so the caller must wrap it in `<Suspense>` — under
 * Cache Components the static shell can't read request-time search params.
 */
export function ReportNotice() {
  const params = useSearchParams();
  if (params.get("subject") !== "report") return null;

  return (
    <div
      role="note"
      className="mx-auto mb-10 flex max-w-2xl gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-left"
    >
      <Flag className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="space-y-1 text-sm leading-relaxed">
        <p className="font-semibold text-foreground">
          Reporting a review or a photo?
        </p>
        <p className="text-muted-foreground">
          Use the form below and tell us which review or photo you mean (the
          reviewer&apos;s name and the platform it came from is enough). If it
          is a picture of you that you would like removed, say so — we take
          it down on request, no questions asked.
        </p>
      </div>
    </div>
  );
}
