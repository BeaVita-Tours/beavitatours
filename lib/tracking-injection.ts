/**
 * Imperative DOM helpers for loading tracking scripts.
 *
 * Tracking scripts are consent-driven, so they load after hydration when the
 * consent cookie is known on the client. Injecting them imperatively (rather
 * than rendering `next/script` elements in a client component) avoids React's
 * "Encountered a script tag" warning and guarantees inline scripts execute —
 * React never evaluates inline script content rendered in a client tree.
 *
 * Injection is idempotent by element id so React StrictMode's double effect
 * setup doesn't load a script twice. Scripts are removed by
 * `clearTrackingArtifacts` (in `lib/cookie-consent.ts`) when consent changes;
 * components never clean up after themselves because the consent lifecycle is
 * centralized in the provider.
 */

export function injectScript({ id, src }: { id: string; src: string }): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

export function injectInlineScript({
  id,
  content,
}: {
  id: string;
  content: string;
}): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
}

/**
 * Remove any existing script with the same id, then inject it again. Used to
 * re-apply a script whose content depends on consent after consent changes.
 */
export function replaceInlineScript({
  id,
  content,
}: {
  id: string;
  content: string;
}): void {
  if (typeof document === "undefined") {
    return;
  }

  document.getElementById(id)?.remove();

  const script = document.createElement("script");
  script.id = id;
  script.textContent = content;
  document.head.appendChild(script);
}
