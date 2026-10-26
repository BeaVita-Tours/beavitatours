import type { PostSummary } from "@/lib/sanity/types";
import { PostCard } from "./post-card";

/** The archive grid of post cards, with the site's empty state. */
export function PostList({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <p className="text-lg font-semibold text-foreground">No posts yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon — new stories are on the way.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
