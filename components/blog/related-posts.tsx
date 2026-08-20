import { getRelatedPosts } from "@/lib/sanity/queries";
import { PostCard } from "./post-card";

interface RelatedPostsProps {
  currentSlug: string;
  categorySlugs: string[];
}

/**
 * "Related stories" — up to three posts sharing the current post's categories
 * (most recent first), falling back to recency when there are none. Async
 * server component: fetches through the cached `getRelatedPosts` accessor.
 */
export async function RelatedPosts({ currentSlug, categorySlugs }: RelatedPostsProps) {
  const posts = await getRelatedPosts({ currentSlug, categorySlugs });
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-10" aria-label="Related stories">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-foreground">Related stories</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
