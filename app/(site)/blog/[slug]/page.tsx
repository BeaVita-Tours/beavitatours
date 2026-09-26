import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/blog/post-article";
import { isSeoPreview } from "@/lib/seo/config";
import { getPost } from "@/lib/blog/queries";

// This route can wait for its publication lookup. Metadata resolves before
// headers are sent (next.config.ts), keeping unpublished URLs at HTTP 404.
export const instant = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const title = post.seo?.seoTitle ?? post.title;
  const description = post.seo?.seoDescription ?? post.excerpt;
  const shareImage = post.seo?.seoImage ?? post.mainImage;
  const imageUrl = shareImage?.asset?.url
    ? shareImage.asset.url
    : undefined;

  return {
    title: `${title} | beaVita Tours Blog`,
    description,
    alternates: { canonical: post.canonical },
    robots: { index: !isSeoPreview(), follow: !isSeoPreview() },
    openGraph: { type: "article", title, description, url: post.canonical, publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt ?? post.publishedAt, ...(imageUrl ? { images: [{ url: imageUrl, width: 1200 }] } : {}) },
    ...(imageUrl ? { twitter: { card: "summary_large_image", title, description, images: [imageUrl] } } : {}),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title,
        description: post.excerpt, inLanguage: "en", mainEntityOfPage: post.canonical,
        datePublished: post.publishedAt, dateModified: post.modifiedAt ?? post.publishedAt,
        ...(post.author ? { author: { "@type": post.author.name === "The beaVita Team" ? "Organization" : "Person", name: post.author.name } } : {}),
        ...(post.mainImage?.asset?.url ? { image: post.mainImage.asset.url } : {}),
      }).replace(/</g, "\\u003c") }} />
      <PostArticle post={post} />
    </main>
  );
}
