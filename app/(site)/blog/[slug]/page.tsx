import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/blog/post-article";
import { getPost } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

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

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const title = post.seo?.seoTitle ?? post.title;
  const description = post.seo?.seoDescription ?? post.excerpt;
  const shareImage = post.seo?.seoImage ?? post.mainImage;
  const imageUrl = shareImage?.asset?.url
    ? urlFor(shareImage).width(1200).url()
    : undefined;

  return {
    title: `${title} | BeaVitaTours Blog`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...(imageUrl
      ? { openGraph: { title, description, images: [{ url: imageUrl, width: 1200 }] } }
      : {}),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main>
      <PostArticle post={post} />
    </main>
  );
}
