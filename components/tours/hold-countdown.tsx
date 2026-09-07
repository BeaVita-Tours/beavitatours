"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

import { refreshHold } from "@/app/(site)/book/actions";
import { cn } from "@/lib/utils";

interface HoldCountdownProps {
  expiresAt: string;
  /** Called once the hold has actually lapsed, so the page can offer recovery. */
  onExpired: () => void;
}

/** Ask for more time once under five minutes remain. */
const PROLONG_THRESHOLD_SECONDS = 5 * 60;

/**
 * The reservation timer.
 *
 * It does two jobs. The visible one is honesty: places really are held, and
 * really are released, so saying so beats a silent failure at the end of the
 * form. The quiet one is keeping the hold alive — once the countdown drops
 * under five minutes it asks the server to extend, so someone typing carefully
 * does not lose their seats mid-sentence.
 *
 * The clock here is a UX affordance, never the authority. Regiondo decides
 * whether a reservation still exists, and the server action surfaces that.
 */
export function HoldCountdown({ expiresAt, onExpired }: HoldCountdownProps) {
  const [deadline, setDeadline] = useState(() => Date.parse(expiresAt));
  const [remaining, setRemaining] = useState(() => secondsUntil(Date.parse(expiresAt)));
  const prolonging = useRef(false);
  const expired = useRef(false);

  useEffect(() => {
    setDeadline(Date.parse(expiresAt));
  }, [expiresAt]);

  useEffect(() => {
    function tick() {
      const left = secondsUntil(deadline);
      setRemaining(left);

      if (left <= 0 && !expired.current) {
        expired.current = true;
        onExpired();
        return;
      }

      if (left > 0 && left <= PROLONG_THRESHOLD_SECONDS && !prolonging.current) {
        prolonging.current = true;
        refreshHold()
          .then((result) => {
            if ("expiresAt" in result) {
              setDeadline(Date.parse(result.expiresAt));
              expired.current = false;
            }
          })
          .finally(() => {
            prolonging.current = false;
          });
      }
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, onExpired]);

  const urgent = remaining > 0 && remaining <= 120;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
        urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
      )}
    >
      <Clock className="size-3.5" aria-hidden="true" />
      {remaining > 0 ? (
        <>
          {/*
            Announce politely and only every 30s: a screen reader reading out a
            changing timer every second makes the form impossible to complete.
          */}
          <span aria-hidden="true">Places held for {formatRemaining(remaining)}</span>
          <span className="sr-only" aria-live="polite">
            {remaining % 30 === 0 ? `Places held for ${formatRemaining(remaining)}` : ""}
          </span>
        </>
      ) : (
        <span aria-live="polite">Reservation expired</span>
      )}
    </p>
  );
}

function secondsUntil(deadline: number): number {
  if (!Number.isFinite(deadline)) return 0;
  return Math.max(0, Math.round((deadline - Date.now()) / 1000));
}

function formatRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
