"use client";

import { useEffect, useRef } from "react";

/**
 * The dateline rule, functioning: a coral hairline pinned to the top of the
 * viewport that fills as the reader scrolls through the article. It sits above
 * the sticky site nav (z-60) — deliberately, so it never has to know the nav's
 * variable height. It updates via a ref (no re-render churn on scroll) and is
 * aria-hidden; the article itself carries the content. Under reduced motion
 * the width snaps instead of transitioning.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      if (barRef.current) {
        barRef.current.style.width = `${Math.round(ratio * 1000) / 10}%`;
      }
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-border/40">
      <div
        ref={barRef}
        className="h-full bg-primary motion-safe:transition-[width] motion-safe:duration-150"
      />
    </div>
  );
}
