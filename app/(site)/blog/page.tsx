import type { Metadata } from "next";
import { BlogCta } from "@/components/blog/blog-cta";
import { BlogHeader } from "@/components/blog/blog-header";
import { CategoryFilter } from "@/components/blog/category-filter";
import { FeaturedPost } from "@/components/blog/featured-post";
import { Pagination } from "@/components/blog/pagination";
import { PostList } from "@/components/blog/post-list";
import {
  getCategories,
  getPosts,
  POSTS_PER_PAGE,
} from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "The Bea Vita Blog — BeaVitaTours",
  description: "Stories from the road between Venice and the Dolomites.",
};

// instant = false: this page reads searchParams (page + category) for
// server-side pagination and filtering, so it's kept dynamic by design.
export const instant = false;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;

  const category = params.category;
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [result, categories] = await Promise.all([
    getPosts({ page: requestedPage, category }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / POSTS_PER_PAGE));
  // Out-of-range page numbers (e.g. ?page=99) clamp silently to the last page.
  const currentPage = Math.min(requestedPage, totalPages);

  const activeCategory = categories.some((c) => c.slug === category) ? category : undefined;

  // The featured "latest story" is the newest post, only on the unfiltered
  // first page; page 1 then shows 8 grid cards + 1 featured = POSTS_PER_PAGE.
  const showFeatured = currentPage === 1 && !activeCategory;
  const featured = showFeatured ? result.posts[0] : undefined;
  const gridPosts = featured ? result.posts.slice(1) : result.posts;

  return (
    <main>
      <BlogHeader
        title="The Bea Vita Blog"
        subtitle="Stories from the road between Venice and the Dolomites."
      />

      {featured ? <FeaturedPost post={featured} /> : null}

      <section className="py-16">
        <div className="container mx-auto px-4">
          {categories.length > 0 ? (
            <div className="mb-10">
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
              />
            </div>
          ) : null}

          {/* A single post on page 1 is the featured lead itself — don't show
              the empty grid state beneath it. */}
          {gridPosts.length > 0 || result.total === 0 ? (
            <PostList posts={gridPosts} />
          ) : null}

          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blog"
              category={activeCategory}
            />
          </div>
        </div>
      </section>

      <BlogCta />
    </main>
  );
}
