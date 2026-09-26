import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import PageContent from "./page-content";

// The page is a Client Component; metadata (the root layout's, unless SEO
// Workspace has approved its own) comes from this server wrapper.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact");
}

export default PageContent;
