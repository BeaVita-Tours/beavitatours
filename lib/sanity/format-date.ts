import { format } from "date-fns";

/** Formats a Sanity `publishedAt` ISO string as e.g. "August 20, 2026". */
export function formatDate(iso: string): string {
  return format(new Date(iso), "MMMM d, yyyy");
}
