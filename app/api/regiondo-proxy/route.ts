import { NextRequest, NextResponse } from "next/server";

const PAGE_BG = "#fcfaf5";

/**
 * Fetches a Regiondo catalog page, modifies it to match the host site's
 * look and feel, and returns the cleaned-up HTML.
 *
 * Modifications:
 *  - Sets <html> and <body> background to match the parent page
 *  - Removes the Regiondo branding footer
 *  - Vertically centers the main content area
 *  - Suppresses cookie-consent popups inside the iframe
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' parameter" },
      { status: 400 },
    );
  }

  let html: string;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 },
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch upstream page" },
      { status: 502 },
    );
  }

  // ── 1. Background colour on <html> ──
  html = html.replace(
    /<html\b([^>]*)>/i,
    (match, attrs) => `<html ${attrs} style="background-color: ${PAGE_BG}">`,
  );

  // ── 2. Background colour on <body> and inline style to remove the
  //    default body background inherited from the whitelabel styles ──
  html = html.replace(
    /<body\b([^>]*)>/i,
    (match, attrs) =>
      `<body ${attrs} style="background-color: ${PAGE_BG};margin:0">`,
  );

  // ── 3. Remove the Regiondo branding footer ──
  // The footer is: <div class="footer wl-background-main"> ... </div>
  // We need to handle nested divs, so we'll track depth.
  html = html.replace(
    /<div\s+class="footer\s+wl-background-main"[^>]*>[\s\S]*?<\/div>\s*(?=<script|<\/body|$)/,
    "",
  );

  // ── 5. Suppress cookie / CMP popups inside the iframe ──
  html = html.replace(
    "</head>",
    `<script>
      window.UC_UI_SUPPRESS_CMP_DISPLAY = true;
      if (typeof UC_UI !== "undefined" && UC_UI?.suppressCMPDisplay) {
        UC_UI.suppressCMPDisplay();
      }
    </script>\n</head>`,
  );

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Allow the parent page to embed this in an iframe
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
      // Avoid fetching stale results
      "Cache-Control": "no-cache, max-age=0",
    },
  });
}
