import { pageMetadata } from "@/lib/seo/metadata";
import PageContent from "./page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(`/${locale}/contact`);
}

export default PageContent;
