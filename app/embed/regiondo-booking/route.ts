import type { NextRequest } from "next/server";

import {
  BOOKING_WIDGET_MESSAGE,
  BOOKING_WIDGET_SCRIPT_URL,
  parseBookingWidgetTarget,
  type BookingWidgetTarget,
} from "@/lib/regiondo/booking-widget";

/**
 * The page the tour page frames: Regiondo's booking widget and nothing else.
 *
 *   /embed/regiondo-booking?widget=<uuid>    a widget made in the Regiondo dashboard
 *
 * Why a frame of our own rather than the element dropped straight into the
 * tour page: Regiondo's loader initialises once per document (it keeps a
 * global "already loaded" flag) and binds to the first widget it finds. The
 * site navigates between tours on the client, so a second tour page would keep
 * the first tour's widget, or none. A fresh document per widget avoids that,
 * and also keeps Regiondo's CSS and ours out of each other's way.
 *
 * The page reports to its parent over postMessage: "ready" once the widget has
 * rendered, "failed" if it does not (the tour page then shows the API booking
 * panel), and its height, so the frame grows with the checkout steps instead
 * of scrolling inside itself.
 *
 * No layout, no analytics, no consent banner: this is a route handler, not a
 * page, so none of the site chrome is in it. It is never indexed.
 */
export function GET(request: NextRequest) {
  const target = parseBookingWidgetTarget(request.nextUrl.searchParams);
  if (!target) {
    return new Response("Unknown booking widget", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
    });
  }

  return new Response(renderPage(target), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // The markup depends on the query string alone, so the CDN can keep it.
      // Short browser lifetime so a fix to this page reaches visitors quickly.
      "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "frame-ancestors 'self'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function widgetElement(target: BookingWidgetTarget): string {
  // The id was validated against a strict pattern, so it cannot break out of
  // the attribute. Escaped anyway: defence in depth costs nothing.
  return `<booking-widget widget-id="${escapeAttr(target.widgetId)}"></booking-widget>`;
}

function renderPage(target: BookingWidgetTarget): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Book this tour</title>
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; }
  booking-widget { display: block; }
</style>
</head>
<body>
${widgetElement(target)}
<script>
(function () {
  var TYPE = ${JSON.stringify(BOOKING_WIDGET_MESSAGE)};
  var framed = window.parent && window.parent !== window;
  function post(message) {
    if (!framed) return;
    message.type = TYPE;
    window.parent.postMessage(message, window.location.origin);
  }

  var el = document.querySelector("booking-widget");
  var started = Date.now();
  var settled = null;
  function settledMessage() {
    return settled.status === "ready" ? { status: "ready" } : { status: "failed", reason: settled.reason };
  }
  function settle(status, reason) {
    // Once failed, stay failed. A "ready" can still turn into "failed": the
    // widget sometimes draws its frame first and its error screen after.
    if (settled && (settled.status === "failed" || status === "ready")) return;
    settled = { status: status, reason: reason };
    post(settledMessage());
  }

  // The tour page may hydrate after this frame has already settled, and a
  // message sent before its listener exists is lost. So it says "hello" once
  // it is listening, and gets the current state again.
  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    var data = event.data;
    if (!data || data.type !== TYPE || data.status !== "hello") return;
    if (settled) post(settledMessage());
    if (lastHeight) post({ status: "height", height: lastHeight });
  });

  // Regiondo renders its own error screens in place of the calendar: "Network
  // Error" from the older widget, "Unable to load / It seems that the server
  // is unreachable" or "The page is gone" from the current one. To the visitor
  // those are failures, so they hand over to the fallback like any other.
  // Matched in English and German: the widget falls back to German when it
  // cannot load its translations, which is exactly when it is failing.
  var ERROR_TEXT = /network error|unable to load|server is unreachable|page is gone|doesn't exist anymore|kann nicht geladen werden|nicht erreichbar|netzwerkfehler/i;

  // The language-independent check: watch the widget's own requests. A
  // Regiondo request that fails outright (network error, CORS refusal,
  // timeout) or with a 5xx while the widget is starting means the visitor is
  // about to see Regiondo's error screen, whatever language it is in. Only
  // Regiondo's hosts count, so an ad blocker eating an analytics call does not
  // take the widget away. Aborted requests are ignored: the widget cancels
  // superseded requests itself.
  var REGIONDO_HOST = /(^|\.)regiondo\.(com|de|net)$/i;
  var STARTUP_MS = 20000;
  function requestFailed(url, why) {
    if (Date.now() - started > STARTUP_MS) return;
    var host = "";
    try { host = new URL(url, window.location.href).hostname; } catch (e) { return; }
    if (REGIONDO_HOST.test(host)) settle("failed", "request:" + why + ":" + host);
  }
  var xhrOpen = XMLHttpRequest.prototype.open;
  var xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__regiondoUrl = String(url);
    return xhrOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    xhr.addEventListener("error", function () { requestFailed(xhr.__regiondoUrl, "network"); });
    xhr.addEventListener("timeout", function () { requestFailed(xhr.__regiondoUrl, "timeout"); });
    xhr.addEventListener("load", function () {
      if (xhr.status >= 500) requestFailed(xhr.__regiondoUrl, String(xhr.status));
    });
    return xhrSend.apply(this, arguments);
  };
  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function (input) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      return realFetch.apply(this, arguments).then(
        function (response) {
          if (response.status >= 500) requestFailed(url, String(response.status));
          return response;
        },
        function (error) {
          if (!error || error.name !== "AbortError") requestFailed(url, "network");
          throw error;
        }
      );
    };
  }
  function rootOf(node) { return node.shadowRoot || node; }
  function text() { return (rootOf(el).textContent || "").trim(); }
  function hasError() { return ERROR_TEXT.test(text()); }
  function hasContent() {
    var root = rootOf(el);
    if (root.querySelector && root.querySelector("input, button, select, table, [class*='DayPicker'], [class*='calendar']")) return true;
    return text().length > 40;
  }

  var poll = setInterval(function () {
    if (hasError()) { clearInterval(poll); settle("failed", "widget-error"); return; }
    // Give a rendered widget a moment: the error replaces a spinner, not the
    // calendar, so content that has stayed put for a second is the real thing.
    if (hasContent() && Date.now() - started > 1500) settle("ready");
    // Keep watching for an error screen until the deadline, even after ready.
    if (Date.now() - started > 20000) {
      clearInterval(poll);
      if (!settled) settle("failed", "timeout");
    }
  }, 300);

  window.addEventListener("vite:preloadError", function () { settle("failed", "chunk"); });

  var lastHeight = 0;
  function reportHeight() {
    // The body's own box, not documentElement.scrollHeight: the latter never
    // reports less than the frame's current height, so the frame could grow
    // but never shrink back after a tall checkout step.
    var height = Math.ceil(Math.max(document.body.getBoundingClientRect().height, el.scrollHeight));
    if (height !== lastHeight) { lastHeight = height; post({ status: "height", height: height }); }
  }
  if (window.ResizeObserver) {
    var observer = new ResizeObserver(reportHeight);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    observer.observe(el);
  }
  setInterval(reportHeight, 500);

  var script = document.createElement("script");
  script.src = ${JSON.stringify(BOOKING_WIDGET_SCRIPT_URL)};
  script.async = true;
  script.onerror = function () { settle("failed", "script"); };
  document.body.appendChild(script);
})();
</script>
</body>
</html>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
