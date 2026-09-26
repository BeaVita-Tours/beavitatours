import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideImage } from "@/components/seo/guide-image";
import { getSnapshot } from "@/lib/seo/client";
import { isSeoPreview, workspaceSiteUrl } from "@/lib/seo/config";
import { listGuides } from "@/lib/seo/publications";

/**
 * Travel guides published from SEO Workspace (English only).
 *
 * instant = false: rendered on demand so the page is a real 404 while the
 * connector is off, and so a SEO Workspace outage surfaces as an error here
 * rather than failing a deploy. The snapshot itself is cached (lib/seo/client).
 */
export const instant = false;

async function guides() {
  const snapshot = await getSnapshot();
  if (!snapshot) notFound();
  return listGuides(snapshot);
}

export async function generateMetadata(): Promise<Metadata> {
  const list = await guides();
  return {
    title: "Travel guides | BeaVitaTours",
    description:
      "Ideas and practical advice for exploring the Dolomites, Prosecco and Veneto.",
    alternates: { canonical: `${workspaceSiteUrl}/guides` },
    robots: {
      index: list.length > 0 && !isSeoPreview(),
      follow: !isSeoPreview(),
    },
  };
}

export default async function GuidesPage() {
  const list = await guides();
  return (
    <main className="container mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Travel guides
      </h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((guide) => (
          <article
            key={guide.id}
            className="rounded-2xl border border-border bg-card p-6"
          >
            {guide.coverImage && (
              <Link
                href={`/guides/${guide.slug}`}
                className="mb-5 block"
                tabIndex={-1}
                aria-hidden="true"
              >
                <GuideImage image={guide.coverImage} />
              </Link>
            )}
            <h2 className="text-xl font-semibold">
              <Link className="hover:underline" href={`/guides/${guide.slug}`}>
                {guide.title}
              </Link>
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {guide.summary}
            </p>
            <Link
              className="mt-6 inline-block font-medium text-primary underline underline-offset-4"
              href={`/guides/${guide.slug}`}
            >
              Read guide
              <span className="sr-only">: {guide.title}</span>
            </Link>
          </article>
        ))}
      </div>
      {!list.length && (
        <p className="mt-8 text-muted-foreground">
          Our travel guides will be available soon.
        </p>
      )}
    </main>
  );
}
