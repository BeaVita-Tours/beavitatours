import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CategoryFilter } from "@/components/blog/category-filter";
import { Pagination } from "@/components/blog/pagination";
import { PostList } from "@/components/blog/post-list";
import {
  getCategories,
  getCategory,
  getPosts,
  POSTS_PER_PAGE,
} from "@/lib/sanity/queries";

// instant = false: this page reads params (the category slug) and searchParams
// (the page number) for server-side pagination, so it's kept dynamic.
export const instant = false;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.title} — Blog | BeaVitaTours`,
    description: category.description ?? `Posts filed under ${category.title}.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const category = await getCategory(slug);
  if (!category) notFound();

  const requestedPage = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const [result, categories] = await Promise.all([
    getPosts({ page: requestedPage, category: slug }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / POSTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);

  return (
    <main>
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border-0 bg-accent uppercase text-accent-foreground">
              Blog
            </Badge>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {category.title}
            </h1>
            {category.description ? (
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {categories.length > 0 ? (
            <div className="mb-10">
              <CategoryFilter categories={categories} activeCategory={slug} />
            </div>
          ) : null}

          <PostList posts={result.posts} />

          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/blog/category/${slug}`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
