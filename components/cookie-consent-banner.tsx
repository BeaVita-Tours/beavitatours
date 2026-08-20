"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/components/cookie-consent-provider";
import { Cookie, Settings, Shield } from "lucide-react";

export function CookieConsentBanner() {
  const { consent, hydrated, acceptAll, rejectAll, openSettings } =
    useCookieConsent();

  if (!hydrated || consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          {/* Content Section */}
          <div className="flex gap-4 p-5 md:p-6">
            <div className="hidden shrink-0 sm:block">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Cookie className="size-6 text-primary" />
              </div>
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Cookie className="size-5 text-primary sm:hidden" />
                <h3 className="text-base font-semibold text-foreground">
                  Cookie settings
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We use cookies to enhance your browsing experience, serve
                personalized ads or content, and analyze our traffic. By
                clicking &quot;Accept all&quot;, you consent to our use of
                cookies. You can also manage your preferences by clicking
                &quot;Manage preferences&quot;.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  <Shield className="size-3.5" />
                  Privacy Policy
                </Link>
                <button
                  onClick={openSettings}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Settings className="size-3.5" />
                  Manage preferences
                </button>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3 border-t border-border/40 bg-muted/30 p-4 md:p-5 lg:border-l lg:border-t-0 lg:bg-transparent">
            <Button
              variant="outline"
              onClick={rejectAll}
              className="h-11 flex-1 border-border/60 text-sm font-medium lg:flex-none lg:px-6"
            >
              Reject all
            </Button>
            <Button
              variant="default"
              onClick={acceptAll}
              className="h-11 flex-1 text-sm font-semibold lg:flex-none lg:px-6"
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
