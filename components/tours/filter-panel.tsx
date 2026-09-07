import Link from "next/link";
import { X } from "lucide-react";

import {
  catalogHref,
  type CatalogSearchParams,
  DURATION_BANDS,
  hasActiveFilters,
  PRICE_BANDS,
  SORT_OPTIONS,
} from "@/lib/regiondo/catalog-params";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  basePath: string;
  params: CatalogSearchParams;
  resultCount: number;
}

const CHIP =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
// White on the lighter --primary is 2.50:1; the deeper stop clears AA.
const CHIP_ON = "bg-primary-strong text-primary-foreground";
const CHIP_OFF = "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-foreground";

/**
 * Catalog filters, as links.
 *
 * Every control here is an `<a>` that changes `searchParams`. No client state,
 * no JavaScript required, and the filtered views are real crawlable URLs —
 * which is most of the point of replacing the widget. It follows
 * `components/blog/category-filter.tsx`, which already does this for the blog.
 *
 * Clicking an active chip clears it, so each row behaves as a toggle group.
 *
 * Group-versus-private is not a filter here: those views are pages of their
 * own, reached from the navbar.
 */
export function FilterPanel({ basePath, params, resultCount }: FilterPanelProps) {
  const active = hasActiveFilters(params);

  return (
    <section aria-label="Filter and sort tours" className="space-y-4">
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <FilterRow label="Price">
          {PRICE_BANDS.map((band) => {
            const on = params.price === band.value;
            return (
              <Chip
                key={band.value}
                href={catalogHref(basePath, params, { price: on ? undefined : band.value })}
                on={on}
              >
                {band.label}
              </Chip>
            );
          })}
        </FilterRow>

        <FilterRow label="Length">
          {DURATION_BANDS.map((band) => {
            const on = params.duration === band.value;
            return (
              <Chip
                key={band.value}
                href={catalogHref(basePath, params, { duration: on ? undefined : band.value })}
                on={on}
              >
                {band.label}
              </Chip>
            );
          })}
        </FilterRow>

        {/*
          Nothing on the site links to `?q=` any more, but an old bookmark or a
          shared link might. When it is present it is shown as a removable chip,
          so a narrowed list is never a mystery.
        */}
        {params.q ? (
          <FilterRow label="Search">
            <Chip href={catalogHref(basePath, params, { q: undefined })} on>
              “{params.q}”
              <X className="ml-1.5 inline size-3.5" aria-hidden="true" />
              <span className="sr-only">, remove</span>
            </Chip>
          </FilterRow>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "tour" : "tours"}
          {active ? " match your filters" : " available"}
          {active ? (
            <>
              {" · "}
              <Link
                href={basePath}
                className="font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Clear all filters
              </Link>
            </>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort</span>
          {SORT_OPTIONS.map((option) => {
            const on = (params.sort ?? "popular") === option.value;
            return (
              <Chip
                key={option.value}
                href={catalogHref(basePath, params, { sort: option.value })}
                on={on}
                className="px-3 py-1 text-xs"
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="shrink-0 text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  href,
  on,
  className,
  children,
}: {
  href: string;
  on: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={cn(CHIP, on ? CHIP_ON : CHIP_OFF, className)}
    >
      {children}
    </Link>
  );
}
