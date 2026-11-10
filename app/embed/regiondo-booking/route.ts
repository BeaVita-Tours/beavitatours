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
 *   /embed/regiondo-booking?widget=<uuid>                        a dashboard widget
 *   /embed/regiondo-booking?provider=BE116&product=298190   a product, by id
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
  // Every value was validated against a strict pattern, so none of them can
  // break out of the attribute. Escaped anyway: defence in depth costs nothing.
  if (target.kind === "widget") {
    return `<booking-widget widget-id="${escapeAttr(target.widgetId)}"></booking-widget>`;
  }
  return `<booking-widget customer-code="${escapeAttr(target.provider)}" product="${escapeAttr(
    target.productId
  )}" locale="${escapeAttr(target.locale)}"></booking-widget>`;
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
  var settled = null;
  function settledMessage() {
    return settled.status === "ready" ? { status: "ready" } : { status: "failed", reason: settled.reason };
  }
  function settle(status, reason) {
    if (settled) return;
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

  // Regiondo renders "Network Error" in place of the calendar when its booking
  // backend cannot be reached. That is a failure as far as the visitor is
  // concerned, so it hands over to the fallback like any other.
  function rootOf(node) { return node.shadowRoot || node; }
  function text() { return (rootOf(el).textContent || "").trim(); }
  function hasError() { return /network error/i.test(text()); }
  function hasContent() {
    var root = rootOf(el);
    if (root.querySelector && root.querySelector("input, button, select, table, [class*='DayPicker'], [class*='calendar']")) return true;
    return text().length > 40;
  }

  var started = Date.now();
  var poll = setInterval(function () {
    if (hasError()) { clearInterval(poll); settle("failed", "network"); return; }
    // Give a rendered widget a moment: the error replaces a spinner, not the
    // calendar, so content that has stayed put for a second is the real thing.
    if (hasContent() && Date.now() - started > 1500) { clearInterval(poll); settle("ready"); return; }
    if (Date.now() - started > 20000) { clearInterval(poll); settle("failed", "timeout"); }
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
