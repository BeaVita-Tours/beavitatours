import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CatalogView } from "@/components/tours/catalog-view";
import { TourGridSkeleton } from "@/components/tours/tour-grid";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

interface CollectionPageProps {
  heading: string;
  intro: string;
  title: string;
  href: string;
  tagId: string;
  /** Passed through unresolved so the await happens inside Suspense. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /** Cross-links to the sibling collection, so neither page is a dead end. */
  sibling: { label: string; href: string };
}

/**
 * The shared shell for the two collection pages.
 *
 * Both are the same page with a different tag, and duplicating the layout would
 * only guarantee they drift. The heading and intro are per-collection so the
 * pages are genuinely different documents rather than the same one filtered —
 * which matters when the whole reason they exist is to rank.
 */
export function CollectionPage({
  heading,
  intro,
  title,
  href,
  tagId,
  searchParams,
  sibling,
}: CollectionPageProps) {
  const trail = [
    { name: "Home", href: "/" },
    { name: "Tours", href: "/tours" },
    { name: title, href },
  ];

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <script {...jsonLdScriptProps(breadcrumbJsonLd(trail))} />

      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {trail.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
              {index === trail.length - 1 ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-4xl font-bold md:text-5xl">{heading}</h1>
        <p className="text-lg text-muted-foreground">{intro}</p>
        <p className="text-sm">
          <Link
            href={sibling.href}
            className="font-medium text-primary-strong underline-offset-4 hover:underline"
          >
            {sibling.label}
          </Link>
        </p>
      </header>

      <Suspense fallback={<TourGridSkeleton />}>
        <CatalogView
          basePath={href}
          searchParams={searchParams}
          forceCollectionId={tagId}
          listName={title}
          emptyTitle="No tours match those filters"
          emptyBody="Try clearing a filter, or browse every departure we run."
        />
      </Suspense>
    </main>
  );
}
