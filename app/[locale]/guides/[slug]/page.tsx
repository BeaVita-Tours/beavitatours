import Link from "next/link";
import { notFound } from "next/navigation";
import { getSnapshot } from "@/lib/seo/client";
import { articleMetadata } from "@/lib/seo/metadata";
import { isGuideLocale } from "@/lib/seo/routes";
import { GuideBody } from "@/components/seo/guide-body";
import { GuideImage } from "@/components/seo/guide-image";

type Props = { params: Promise<{ locale: string; slug: string }> };
async function findArticle({ locale, slug }: { locale: string; slug: string }) {
  if (!isGuideLocale(locale) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    notFound();
  const snapshot = await getSnapshot();
  const article = snapshot?.articles.find(
    (a) => a.language === locale && a.slug === slug,
  );
  if (!article) notFound();
  return article;
}
export async function generateMetadata({ params }: Props) {
  return articleMetadata(await findArticle(await params));
}
export default async function GuidePage({ params }: Props) {
  const article = await findArticle(await params),
    italian = article.language === "it";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    inLanguage: article.language,
    datePublished: article.publishedAt,
    mainEntityOfPage: article.canonical,
    ...(article.coverImage ? { image: article.coverImage.url } : {}),
    publisher: {
      "@type": "Organization",
      name: "BeaVitaTours",
      url: "https://www.beavitatours.com",
    },
  };
  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article>
        <header className="mx-auto mb-8 max-w-3xl space-y-5">
          <Link
            href={`/${article.language}/guides`}
            className="inline-block text-sm underline underline-offset-4"
          >
            {italian ? "Tutte le guide" : "All guides"}
          </Link>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {article.title}
          </h1>
          <p className="text-xl leading-8 text-muted-foreground">
            {article.summary}
          </p>
          <time
            className="block text-sm text-muted-foreground"
            dateTime={article.publishedAt}
          >
            {new Intl.DateTimeFormat(italian ? "it-IT" : "en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(article.publishedAt))}
          </time>
        </header>
        {article.coverImage && (
          <div className="mb-10 md:mb-14">
            <GuideImage image={article.coverImage} priority />
          </div>
        )}
        <div className="mx-auto max-w-3xl">
          <GuideBody body={article.body} />
          <aside className="mt-12 rounded-xl border bg-muted/30 p-6">
            <h2 className="text-xl font-semibold">
              {italian ? "Organizza la tua esperienza" : "Plan your experience"}
            </h2>
            <Link
              className="mt-4 inline-block rounded-md bg-secondary px-5 py-3 font-medium text-secondary-foreground hover:opacity-90"
              href={article.tourPath}
            >
              {italian ? "Scopri il tour" : "Explore the tour"}
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
