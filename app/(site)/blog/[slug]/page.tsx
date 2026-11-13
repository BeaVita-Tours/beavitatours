import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostArticle } from "@/components/blog/post-article";
import { getPost } from "@/lib/blog/catalog";
import { urlFor } from "@/lib/sanity/image";
import { articleStructuredData, guideMetadata } from "@/lib/seo/metadata";
import { publicationPath, publicationUrl } from "@/lib/seo/publications";

// instant = false: post pages render on demand so unknown slugs return a real
// 404. (In a statically adopted / partial-prerendered route, notFound() thrown
// from the streamed content slot cannot change the HTTP status once the static
// shell has committed a 200 — a soft-404. Rendering dynamically keeps status
// correct; the body still reads from the cached "blog" query, so renders stay
// cheap and new posts appear without a redeploy.)
export const instant = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// A prerendered 404 lets unknown and withdrawn posts return HTTP 404 instead
// of committing a 200 fallback shell before the publication lookup finishes.
export function generateStaticParams() {
  return [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "_") notFound();
  const post = await getPost(slug);
  if (!post) notFound();
  if (post.seoPublication) {
    const article = post.seoPublication;
    if (publicationPath(article) !== `/blog/${slug}`)
      permanentRedirect(publicationPath(article));
    return guideMetadata({
      ...article,
      url: publicationUrl(article),
      tourHref: article.tourPath,
    });
  }

  const title = post.seo?.seoTitle ?? post.title;
  const description = post.seo?.seoDescription ?? post.excerpt;
  const shareImage = post.seo?.seoImage ?? post.mainImage;
  const imageUrl = shareImage?.asset?.url
    ? urlFor(shareImage).width(1200).url()
    : undefined;

  return {
    title: `${title} | beaVita Tours Blog`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...(imageUrl
      ? {
          openGraph: {
            title,
            description,
            images: [{ url: imageUrl, width: 1200 }],
          },
        }
      : {}),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  if (slug === "_") notFound();
  const post = await getPost(slug);
  if (!post) notFound();
  if (
    post.seoPublication &&
    publicationPath(post.seoPublication) !== `/blog/${slug}`
  )
    permanentRedirect(publicationPath(post.seoPublication));

  return (
    <main>
      {post.seoPublication && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              articleStructuredData({
                ...post.seoPublication,
                url: publicationUrl(post.seoPublication),
                tourHref: post.seoPublication.tourPath,
              }),
            ).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <PostArticle post={post} publication={post.seoPublication} />
    </main>
  );
}
