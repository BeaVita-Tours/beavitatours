"use client";

import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Whether to pause the animation regardless of hover (e.g. while a review
   * inspector opened from a card is on screen). Uses the same
   * `[animation-play-state:paused]` mechanism as hover-to-pause.
   * @default false
   */
  paused?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
  /**
   * Enable touch scrolling. On coarse-pointer (touch) devices the row becomes
   * horizontally scrollable by finger, and the auto-scroll animation pauses
   * while the user scrolls and resumes once they stop (a short debounce so
   * momentum scrolling is also covered). Desktop (fine-pointer) behaviour is
   * unchanged: auto-scroll with hover-to-pause.
   * @default false
   */
  touchScroll?: boolean;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  children,
  vertical = false,
  repeat = 4,
  touchScroll = false,
  ...props
}: MarqueeProps) {
  // While `isScrolling`, the CSS animation is held paused so the finger can
  // pan the row without fighting the transform. Debounced so momentum scrolling
  // (which keeps firing `scroll` events after the finger lifts) stays paused
  // until it settles.
  const [isScrolling, setIsScrolling] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerDown = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!touchScroll) {
      setIsScrolling(false);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const clearTimer = () => {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
        resumeTimer.current = null;
      }
    };

    // Pause now and schedule a resume. A resume is skipped while a pointer is
    // still down (a held finger), and every new `scroll` event (a drag or
    // momentum) resets the timer, so the animation only resumes once the
    // interaction has fully settled.
    const pause = () => {
      setIsScrolling(true);
      clearTimer();
      resumeTimer.current = setTimeout(() => {
        if (!isPointerDown.current) setIsScrolling(false);
      }, 180);
    };

    const handlePointerDown = () => {
      isPointerDown.current = true;
      pause();
    };
    const handlePointerUp = () => {
      isPointerDown.current = false;
      pause();
    };

    el.addEventListener("scroll", pause, { passive: true });
    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerUp);

    return () => {
      el.removeEventListener("scroll", pause);
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointerup", handlePointerUp);
      el.removeEventListener("pointercancel", handlePointerUp);
      clearTimer();
      isPointerDown.current = false;
    };
  }, [touchScroll]);

  const shouldPause = paused || isScrolling;

  // 100s (originally was 40 seconds) so the reviews strip scrolls calmly. The reviews marquee is
  // the only Marquee consumer, so the tuning lives here.
  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        "group flex gap-(--gap) p-2 [--duration:100s] [--gap:1rem]",
        touchScroll
          ? cn(
              "[-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              vertical
                ? "overflow-x-hidden overflow-y-auto overscroll-y-contain"
                : "overflow-x-auto overflow-y-hidden overscroll-x-contain",
            )
          : "overflow-hidden",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "group-active:[animation-play-state:paused]": pauseOnHover,
              "[animation-play-state:paused]": shouldPause,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
