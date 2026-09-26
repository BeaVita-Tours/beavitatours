"use client";

import { useState } from "react";
import { Check, Facebook, Link2, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareRowProps {
  title: string;
  /** Route path, e.g. "/blog/slug". The origin is resolved client-side. */
  path: string;
}

const ICON_BUTTON =
  "flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Small share row. URLs are built in the click handlers (never during render)
 * so there is no SSR/client hydration mismatch, and `window.open` /
 * `navigator.clipboard` only ever run on the client.
 */
export function ShareRow({ title, path }: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = () => `${window.location.origin}${path}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (permissions/HTTP); the button just stays quiet.
    }
  };

  return (
    <div className="mt-10 flex items-center gap-3">
      <span className="mr-2 text-sm font-semibold text-foreground">Share</span>
      <button
        type="button"
        aria-label="Share on X"
        className={ICON_BUTTON}
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}&text=${encodeURIComponent(title)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <Twitter className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Share on Facebook"
        className={ICON_BUTTON}
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <Facebook className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Copy link"
        className={cn(ICON_BUTTON, copied && "border-primary text-primary")}
        onClick={copyLink}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
      <span className="ml-auto hidden text-xs text-muted-foreground sm:block" aria-live="polite">
        {copied ? "Link copied" : "Share this article"}
      </span>
    </div>
  );
}
