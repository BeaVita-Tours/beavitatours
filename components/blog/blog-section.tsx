import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/lib/sanity/queries";
import { PostCard } from "./post-card";

/**
 * Homepage blog band — the three latest stories, shown beneath the reviews.
 *
 * Uses the same centered header and card grid as the other homepage sections
 * (Tours, Reviews), but sits on a muted band so it reads as the quiet closing
 * chapter of the page, separating the animated reviews marquee above from the
 * muted footer below. The heading echoes the blog page's own tagline ("Stories
 * from the road between Venice and the Dolomites") with the word "road" in the
 * site's teal, and the "View all stories" action sits below the grid as the
 * site's standard filled button.
 *
 * Failure modes (never a broken section): with no Sanity configured or no
 * posts published yet, `getPosts` returns an empty list, the grid is hidden,
 * and the header (plus the button into the archive) still renders — the same
 * robustness the reviews section follows.
 */
export async function BlogSection() {
  const { posts } = await getPosts({ page: 1 });
  const latest = posts.slice(0, 3);

  return (
    <section id="blog" className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Stories from the <span className="text-primary">road</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Guides, tips and first-hand notes from our day trips around Venice —
            the stops worth making and the roads worth taking.
          </p>
        </div>

        {latest.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((post, index) => (
              <PostCard key={post._id} post={post} latest={index === 0} />
            ))}
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="group">
            <Link href="/blog">
              View all stories
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
