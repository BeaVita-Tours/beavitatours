import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/seo/client";
import { isSeoPreview, siteUrl } from "@/lib/seo/config";
import { isGuideLocale } from "@/lib/seo/routes";
import { GuideImage } from "@/components/seo/guide-image";

type Props = { params: Promise<{ locale: string }> };
async function guides(locale: string) {
  if (!isGuideLocale(locale)) notFound();
  const snapshot = await getSnapshot();
  if (!snapshot) notFound();
  return snapshot.articles
    .filter((a) => a.language === locale)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const articles = await guides(locale);
  return {
    title:
      locale === "it"
        ? "Guide di viaggio | BeaVitaTours"
        : "Travel guides | BeaVitaTours",
    description:
      locale === "it"
        ? "Idee e consigli per esplorare le Dolomiti, il Prosecco e il Veneto."
        : "Ideas and practical advice for exploring the Dolomites, Prosecco and Veneto.",
    alternates: { canonical: `${siteUrl}/${locale}/guides` },
    robots: {
      index: articles.length > 0 && !isSeoPreview(),
      follow: !isSeoPreview(),
    },
  };
}
export default async function GuidesPage({ params }: Props) {
  const { locale } = await params,
    articles = await guides(locale);
  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {locale === "it" ? "Guide di viaggio" : "Travel guides"}
      </h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.id} className="rounded-xl border bg-card p-6">
            {article.coverImage && (
              <Link
                href={`/${locale}/guides/${article.slug}`}
                className="mb-5 block"
                tabIndex={-1}
                aria-hidden="true"
              >
                <GuideImage image={article.coverImage} />
              </Link>
            )}
            <h2 className="text-xl font-semibold">
              <Link
                className="hover:underline"
                href={`/${locale}/guides/${article.slug}`}
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {article.summary}
            </p>
            <Link
              className="mt-6 inline-block font-medium underline underline-offset-4"
              href={`/${locale}/guides/${article.slug}`}
            >
              {locale === "it" ? "Leggi la guida" : "Read guide"}
              <span className="sr-only">: {article.title}</span>
            </Link>
          </article>
        ))}
      </div>
      {!articles.length && (
        <p className="mt-8 text-muted-foreground">
          {locale === "it"
            ? "Le nostre guide saranno disponibili presto."
            : "Our travel guides will be available soon."}
        </p>
      )}
    </main>
  );
}
