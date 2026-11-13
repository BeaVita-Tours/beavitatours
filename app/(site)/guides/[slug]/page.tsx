import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { GuideBody } from "@/components/seo/guide-body";
import { GuideImage } from "@/components/seo/guide-image";
import { Button } from "@/components/ui/button";
import { getSnapshot } from "@/lib/seo/client";
import { workspaceSiteUrl } from "@/lib/seo/config";
import { guideMetadata, articleStructuredData } from "@/lib/seo/metadata";
import { findGuide } from "@/lib/seo/publications";

// Guides render on demand, reading the cached snapshot (lib/seo/client).
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

/**
 * Deliberately no real guides here: listing them would make every build depend
 * on SEO Workspace. But the route needs a `generateStaticParams` — without one,
 * a request for an unknown or withdrawn guide is served from the fallback shell
 * and its 404 goes out as a 200. Cache Components requires at least one entry,
 * so this is a placeholder that fails the slug check below: it prerenders as a
 * 404 without a network call.
 */
export function generateStaticParams() {
  return [{ slug: "_" }];
}

async function guideFor(params: Props["params"]) {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const snapshot = await getSnapshot();
  const guide = snapshot && findGuide(snapshot, slug);
  if (!guide) notFound();
  const path = new URL(guide.url).pathname;
  if (path !== `/guides/${slug}`) permanentRedirect(path);
  return guide;
}

export async function generateMetadata({ params }: Props) {
  return guideMetadata(await guideFor(params));
}

export default async function GuidePage({ params }: Props) {
  const guide = await guideFor(params);
  const jsonLd = {
    ...articleStructuredData(guide),
    publisher: {
      "@type": "Organization",
      name: "BeaVitaTours",
      url: workspaceSiteUrl,
    },
  };
  return (
    <main>
      <article className="container mx-auto px-4 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" />
          All guides
        </Link>

        <div className="mx-auto mt-8 max-w-3xl">
          <h1 className="text-center text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-6 text-center text-xl leading-8 text-muted-foreground">
            {guide.summary}
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <time dateTime={guide.publishedAt}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(guide.publishedAt))}
            </time>
          </div>

          {guide.coverImage && (
            <div className="mt-8">
              <GuideImage image={guide.coverImage} priority />
            </div>
          )}

          <div className="mt-10">
            <GuideBody body={guide.body} images={guide.blog?.inlineImages} />
          </div>

          {guide.blog && (
            <aside className="mt-8 rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold">
                {guide.blog.author.name}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {guide.blog.author.bio}
              </p>
              <p className="mt-3 text-sm">
                {guide.blog.categories.map((c) => c.title).join(", ")}
              </p>
            </aside>
          )}

          <aside className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Plan your experience</h2>
            <Button asChild className="mt-4">
              <Link href={guide.tourHref}>Explore the tour</Link>
            </Button>
          </aside>
        </div>
      </article>
    </main>
  );
}
