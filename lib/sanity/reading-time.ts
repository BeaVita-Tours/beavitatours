const WORDS_PER_MINUTE = 200;

/**
 * Estimated reading time in minutes for a plain-text string, as produced by
 * GROQ's `pt::text(body)`. Returns 0 for empty/missing text so callers can
 * drop the "· N min read" segment from the meta line.
 */
export function readingTimeInMinutes(text: string | null | undefined): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return words === 0 ? 0 : Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
