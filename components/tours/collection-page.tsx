import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CatalogView } from "@/components/tours/catalog-view";
import { TourGridSkeleton } from "@/components/tours/tour-grid";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/regiondo/structured-data";

/** Which of the three catalog pages this is; drives the breadcrumb trail. */
export type TravelStyle = "all" | "shared" | "private";

interface CollectionPageProps {
  style: TravelStyle;
  heading: string;
  intro: string;
  /** Short name for the breadcrumb and the ItemList markup. */
  title: string;
  href: string;
  /** Pins the catalog to one Regiondo tag. Omit on `/tours`. */
  tagId?: string;
  /** Passed through unresolved so the await happens inside Suspense. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  /**
   * False renders the page without the catalog — for
   * `/tours/private-tours` while the native flow is off, when the tailor-made
   * offer below is the whole page and the sibling pages do not exist yet.
   */
  catalog?: boolean;
  /** Extra sections after the grid, e.g. the tailor-made offer. */
  children?: React.ReactNode;
}

/**
 * The shared shell for the three catalog pages: `/tours`, `/tours/group-tours`
 * and `/tours/private-tours`.
 *
 * They are one list viewed three ways; the navbar is what moves you between
 * them. The heading and intro are per-page so each is a genuinely different
 * document rather than the same one filtered — which matters when the whole
 * reason the collection pages exist is to rank.
 */
export function CollectionPage({
  style,
  heading,
  intro,
  title,
  href,
  tagId,
  searchParams,
  catalog = true,
  children,
}: CollectionPageProps) {
  const trail = [{ name: "Home", href: "/" }];
  if (style === "all" || !catalog) {
    trail.push({ name: title, href });
  } else {
    trail.push({ name: "Tours", href: "/tours" }, { name: title, href });
  }

  return (
    <main className="container mx-auto px-4 py-10 md:py-14">
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

      <header className="mb-8 max-w-2xl space-y-3">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{heading}</h1>
        <p className="text-lg text-muted-foreground">{intro}</p>
      </header>

      {catalog ? (
        <div className="space-y-8">
          <Suspense fallback={<TourGridSkeleton />}>
            <CatalogView
              basePath={href}
              searchParams={searchParams}
              forceCollectionId={tagId}
              listName={title}
              emptyTitle="No tours match those filters"
              emptyBody="Try clearing a filter, or switch to every departure we run."
            />
          </Suspense>
        </div>
      ) : null}

      {children ? <div className={catalog ? "mt-16" : "mt-4"}>{children}</div> : null}
    </main>
  );
}
