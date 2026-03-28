"use client";

import * as React from "react";
import type {
  ConsentPreferences,
  ConsentRecord,
} from "@/lib/cookie-consent";
import {
  ALL_CONSENT,
  buildConsentCookie,
  clearTrackingArtifacts,
  createConsentRecord,
  DEFAULT_CONSENT,
  parseConsentRecord,
} from "@/lib/cookie-consent";

type CookieConsentContextValue = {
  consent: ConsentRecord | null;
  hasAnalyticsConsent: boolean;
  hasMarketingConsent: boolean;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
};

const CookieConsentContext = React.createContext<CookieConsentContextValue | null>(
  null
);

function writeConsentCookie(record: ConsentRecord) {
  const secure = window.location.protocol === "https:";

  document.cookie = buildConsentCookie(record, secure);
}

function getConsentAction(preferences: ConsentPreferences) {
  if (preferences.analytics && preferences.marketing) {
    return "accept-all" as const;
  }

  if (!preferences.analytics && !preferences.marketing) {
    return "reject-all" as const;
  }

  return "custom" as const;
}

export function CookieConsentProvider({
  children,
  initialConsent,
}: {
  children: React.ReactNode;
  initialConsent: ConsentRecord | null;
}) {
  const [consent, setConsent] = React.useState<ConsentRecord | null>(initialConsent);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const hasAnalyticsConsent = Boolean(consent?.preferences.analytics);
  const hasMarketingConsent = Boolean(consent?.preferences.marketing);

  React.useEffect(() => {
    if (!consent || consent.action === "reject-all") {
      clearTrackingArtifacts();
    }
  }, [consent]);

  const savePreferences = React.useCallback(
    (preferences: ConsentPreferences) => {
      const currentPreferences = consent?.preferences;

      if (
        currentPreferences &&
        currentPreferences.analytics === preferences.analytics &&
        currentPreferences.marketing === preferences.marketing
      ) {
        setIsSettingsOpen(false);
        return;
      }

      const record = createConsentRecord(preferences, getConsentAction(preferences));
      setConsent(record);
      writeConsentCookie(record);
      clearTrackingArtifacts();
      setIsSettingsOpen(false);
    },
    [consent]
  );

  const openSettings = React.useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const acceptAll = React.useCallback(() => {
    savePreferences(ALL_CONSENT);
  }, [savePreferences]);

  const rejectAll = React.useCallback(() => {
    savePreferences(DEFAULT_CONSENT);
  }, [savePreferences]);

  const value = React.useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasAnalyticsConsent,
      hasMarketingConsent,
      isSettingsOpen,
      openSettings,
      closeSettings,
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [
      acceptAll,
      closeSettings,
      consent,
      hasAnalyticsConsent,
      hasMarketingConsent,
      isSettingsOpen,
      openSettings,
      rejectAll,
      savePreferences,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = React.useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }

  return context;
}

export function getInitialConsentFromCookie(rawCookieValue: string | null | undefined) {
  return parseConsentRecord(rawCookieValue);
}
