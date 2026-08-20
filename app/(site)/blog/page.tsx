import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Pagination } from "@/components/blog/pagination";
import { PostList } from "@/components/blog/post-list";
import {
  getCategories,
  getPosts,
  POSTS_PER_PAGE,
} from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Blog — BeaVitaTours",
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

  return (
    <main>
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-0 bg-accent uppercase text-accent-foreground">
              Blog
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              The Bea Vita Blog
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Stories from the road between Venice and the Dolomites.
            </p>
          </div>
        </div>
      </section>

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

          <PostList posts={result.posts} />

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
    </main>
  );
}
