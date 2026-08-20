import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path the page numbers link to, e.g. "/blog". */
  basePath: string;
  /** Optional category filter to preserve in links, e.g. "dolomites". */
  category?: string;
}

function pageHref(basePath: string, category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Builds a compact page-number window: first, last, and a few around current. */
function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const out: (number | "ellipsis")[] = [];
  for (const page of sorted) {
    if (out.length > 0 && page - (out[out.length - 1] as number) > 1) {
      out.push("ellipsis");
    }
    out.push(page);
  }
  return out;
}

export function Pagination({ currentPage, totalPages, basePath, category }: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClasses =
    "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {currentPage > 1 ? (
        <Link
          href={pageHref(basePath, category, currentPage - 1)}
          className={cn(linkClasses, "text-muted-foreground hover:bg-muted")}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(linkClasses, "cursor-not-allowed text-muted-foreground/40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageWindow(currentPage, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className={cn(linkClasses, "text-muted-foreground/50")}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, category, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              linkClasses,
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(basePath, category, currentPage + 1)}
          className={cn(linkClasses, "text-muted-foreground hover:bg-muted")}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(linkClasses, "cursor-not-allowed text-muted-foreground/40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
