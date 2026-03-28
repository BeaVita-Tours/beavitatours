export const CONSENT_COOKIE_NAME = "beavita_cookie_consent";
export const CONSENT_VERSION = "1";

export type ConsentAction = "accept-all" | "reject-all" | "custom";

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  version: string;
  action: ConsentAction;
  timestamp: string;
  preferences: ConsentPreferences;
};

export const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const ALL_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

const TRACKING_COOKIE_PREFIXES = [
  "_ga",
  "_gid",
  "_gat",
  "_gac",
  "_gcl",
  "_fb",
  "_fbc",
  "_fbp",
  "_hj",
  "_clck",
  "_clsk",
  "_ttp",
  "FPID",
  "FPAU",
  "IDE",
  "test_cookie",
];

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) | undefined;
    _fbq?: unknown;
    gtag?: ((...args: unknown[]) => void) | undefined;
    dataLayer: Array<Record<string, unknown>>;
    google_tag_manager?: Record<string, unknown> | undefined;
  }
}

function isConsentAction(value: unknown): value is ConsentAction {
  return value === "accept-all" || value === "reject-all" || value === "custom";
}

function isConsentPreferences(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const preferences = value as Record<string, unknown>;

  return (
    preferences.necessary === true &&
    typeof preferences.analytics === "boolean" &&
    typeof preferences.marketing === "boolean"
  );
}

export function createConsentRecord(
  preferences: ConsentPreferences,
  action: ConsentAction
): ConsentRecord {
  return {
    version: CONSENT_VERSION,
    action,
    timestamp: new Date().toISOString(),
    preferences: {
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    },
  };
}

export function parseConsentRecord(rawValue: string | null | undefined): ConsentRecord | null {
  if (!rawValue) {
    return null;
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(decodeURIComponent(rawValue));
  } catch {
    return null;
  }

  if (!parsedValue || typeof parsedValue !== "object") {
    return null;
  }

  const candidate = parsedValue as Record<string, unknown>;

  if (
    candidate.version !== CONSENT_VERSION ||
    !isConsentAction(candidate.action) ||
    typeof candidate.timestamp !== "string" ||
    !isConsentPreferences(candidate.preferences)
  ) {
    return null;
  }

  return {
    version: candidate.version,
    action: candidate.action,
    timestamp: candidate.timestamp,
    preferences: candidate.preferences,
  };
}

export function parseConsentFromCookieHeader(
  cookieHeader: string | null | undefined
): ConsentRecord | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE_NAME}=([^;]+)`)
  );

  if (!match) {
    return null;
  }

  return parseConsentRecord(match[1]);
}

export function buildConsentCookie(
  record: ConsentRecord,
  secure: boolean
): string {
  const parts = [
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(record))}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearConsentCookie(secure: boolean): string {
  const parts = [
    `${CONSENT_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Lax",
  ];

  if (secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function deleteCookie(name: string) {
  const secure = window.location.protocol === "https:";

  document.cookie = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearTrackingArtifacts() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (typeof window.fbq === "function") {
    window.fbq("consent", "revoke");
  }

  window.fbq = undefined;
  window._fbq = undefined;
  window.gtag = undefined;
  window.dataLayer = [];
  window.google_tag_manager = undefined;

  const cookieNames = new Set<string>();

  for (const item of document.cookie.split(";")) {
    const name = item.split("=")[0]?.trim();

    if (!name || name === CONSENT_COOKIE_NAME) {
      continue;
    }

    if (TRACKING_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
      cookieNames.add(name);
    }
  }

  for (const name of cookieNames) {
    deleteCookie(name);
  }

  const selectors = [
    'script[id^="meta-pixel-script"]',
    'script[id^="google-tag-manager-script"]',
    'iframe[title="Google Tag Manager"]',
  ];

  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  }
}
