"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroSlideshowProps {
  slides: readonly HeroSlide[];
  /** Name for the dots' group, e.g. "Private tours photos". */
  label: string;
  /** Milliseconds each photo stays up. */
  interval?: number;
  /**
   * Delay before the first change, so two slideshows side by side do not
   * turn over in the same instant.
   */
  offset?: number;
}

/**
 * A hero panel's photographs, cross-fading on a timer (client, 2026-09-29:
 * three photos per panel rather than one).
 *
 * The first photo is the panel's LCP image and renders server-side with
 * `priority`; the rest sit beneath it at zero opacity. With reduced motion
 * the timer never starts — the dots still change the photo.
 */
export function HeroSlideshow({ slides, label, interval = 6000, offset = 0 }: HeroSlideshowProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number;
    const advance = () => {
      setActive((index) => (index + 1) % slides.length);
      timer = window.setTimeout(advance, interval);
    };
    timer = window.setTimeout(advance, interval + offset);
    return () => window.clearTimeout(timer);
  }, [slides.length, interval, offset, paused]);

  return (
    <>
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={index === active ? slide.alt : ""}
          aria-hidden={index === active ? undefined : true}
          fill
          priority={index === 0}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
            index === active ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {slides.length > 1 ? (
        // Above the scrim and the copy, so the dots stay clickable.
        <div
          role="group"
          aria-label={label}
          className="absolute inset-x-0 bottom-1.5 z-10 flex justify-center gap-0.5"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show photo ${index + 1} of ${slides.length}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => {
                // A visitor who picks a photo gets to keep looking at it.
                setPaused(true);
                setActive(index);
              }}
              // The padding is the touch target; the span is the dot.
              className="group rounded-full p-1.5 focus-visible:outline-2 focus-visible:outline-white"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all group-hover:bg-white",
                  index === active ? "w-6 bg-white" : "w-1.5 bg-white/60"
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
