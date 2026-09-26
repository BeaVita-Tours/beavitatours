import { notFound, permanentRedirect } from "next/navigation";
import { getSnapshot } from "@/lib/seo/client";
export const instant = false;
async function resolveGuide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const article = snapshot?.articles.find((article) => article.language === "en" &&
    (article.aliases ?? []).some((alias) => new URL(alias).pathname === `/guides/${slug}` || new URL(alias).pathname === `/en/guides/${slug}`));
  if (!article) notFound();
  permanentRedirect(`/blog/${article.slug}`);
}

// Resolve the redirect before a streamed page can commit a 200 response.
export const generateMetadata = resolveGuide;
export default resolveGuide;
