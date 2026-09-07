import "server-only";

import sanitizeHtmlLib from "sanitize-html";

import type { SafeHtml } from "./types";

/**
 * Regiondo descriptions and every `faq_*` field arrive as HTML authored in the
 * supplier dashboard. It is our own content, but it still reaches us over the
 * wire, so it is sanitised on the way in rather than trusted.
 *
 * The allowlist is deliberately narrow — it covers exactly what the live data
 * uses (paragraphs, lists, headings, emphasis, the occasional link) and nothing
 * that could carry script or layout. Anything outside it is stripped, so a
 * supplier pasting a tracking pixel or an iframe into a description cannot put
 * a third-party request on the critical path of a tour page.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "a",
  "span",
];

const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Supplier links point off-site; never leak the referrer or hand over
  // window.opener.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" },
    }),
    // The API sometimes opens a description with an <h1>. A tour page already
    // has exactly one h1 (the title), so demote rather than drop the content.
    h1: () => ({ tagName: "h2", attribs: {} }),
  },
  disallowedTagsMode: "discard",
};

export function sanitizeHtml(html: string | null | undefined): SafeHtml {
  if (!html) return "" as SafeHtml;
  return sanitizeHtmlLib(html, OPTIONS).trim() as SafeHtml;
}

/** Sanitise, returning null when the result has no content worth rendering. */
export function sanitizeHtmlOrNull(html: string | null | undefined): SafeHtml | null {
  const clean = sanitizeHtml(html);
  return stripTags(clean).length > 0 ? clean : null;
}

/**
 * Plain text for `<meta>` tags, JSON-LD and `alt` attributes, where markup
 * would be shown literally. Also collapses the `\r\n` runs the API is fond of.
 */
export function stripTags(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate on a word boundary, for meta descriptions. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
