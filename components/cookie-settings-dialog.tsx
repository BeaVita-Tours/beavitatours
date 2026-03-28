"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_CONSENT,
  type ConsentPreferences,
} from "@/lib/cookie-consent";
import { useCookieConsent } from "@/components/cookie-consent-provider";

type PreferenceState = ConsentPreferences;

export function CookieSettingsDialog() {
  const t = useTranslations("cookieConsent");
  const {
    consent,
    isSettingsOpen,
    closeSettings,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState<PreferenceState>(
    consent?.preferences ?? DEFAULT_CONSENT
  );

  useEffect(() => {
    if (isSettingsOpen) {
      setPreferences(consent?.preferences ?? DEFAULT_CONSENT);
    }
  }, [consent, isSettingsOpen]);

  const updatePreference = (key: "analytics" | "marketing", value: boolean) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Dialog
      open={isSettingsOpen}
      onOpenChange={(open) => {
        if (open) {
          return;
        }

        closeSettings();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settingsTitle")}</DialogTitle>
          <DialogDescription className="space-y-3">
            <span className="block">{t("settingsDescription")}</span>
            <Link
              href="/privacy"
              className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t("privacyPolicy")}
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-base">{t("necessary")}</Label>
                <Badge variant="secondary">{t("alwaysActive")}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("necessaryDescription")}
              </p>
            </div>
            <Switch checked disabled aria-label={t("necessary")} />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-1">
              <Label htmlFor="cookie-analytics" className="text-base">
                {t("analytics")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("analyticsDescription")}
              </p>
            </div>
            <Switch
              id="cookie-analytics"
              checked={preferences.analytics}
              onCheckedChange={(checked) => updatePreference("analytics", checked)}
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-1">
              <Label htmlFor="cookie-marketing" className="text-base">
                {t("marketing")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("marketingDescription")}
              </p>
            </div>
            <Switch
              id="cookie-marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) => updatePreference("marketing", checked)}
            />
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={rejectAll}>
              {t("rejectAll")}
            </Button>
            <Button variant="secondary" onClick={acceptAll}>
              {t("acceptAll")}
            </Button>
          </div>
          <Button
            onClick={() => savePreferences(preferences)}
            className="w-full sm:w-auto"
          >
            {t("savePreferences")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
