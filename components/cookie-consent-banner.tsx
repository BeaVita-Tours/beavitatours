"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCookieConsent } from "@/components/cookie-consent-provider";

export function CookieConsentBanner() {
  const t = useTranslations("cookieConsent");
  const { consent, acceptAll, rejectAll, openSettings } = useCookieConsent();

  if (consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-5xl border-border/60 bg-background/95 shadow-2xl backdrop-blur">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("title")}
              </p>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {t("description")}
              </p>
              <div className="space-y-1 text-sm">
                <Link
                  href="/privacy"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {t("privacyPolicy")}
                </Link>
                <p className="text-muted-foreground">{t("learnMore")}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
              <Button
                variant="ghost"
                onClick={openSettings}
                className="w-full sm:w-auto"
              >
                {t("managePreferences")}
              </Button>
              <Button
                variant="outline"
                onClick={rejectAll}
                className="w-full sm:w-auto"
              >
                {t("rejectAll")}
              </Button>

              <Button
                variant="default"
                onClick={acceptAll}
                className="w-full sm:w-auto"
              >
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
