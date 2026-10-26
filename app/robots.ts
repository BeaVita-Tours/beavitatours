import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { isSeoPreview } from "@/lib/seo/config";

const robots = (): MetadataRoute.Robots =>
  // Preview deployments (and SEO Workspace preview mode) are never crawled.
  isSeoPreview()
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: {
          userAgent: "*",
          allow: "/",
          // /book/* is the checkout and confirmation flow. Both also send
          // `noindex` in their metadata; this stops the crawl budget being spent on
          // them in the first place.
          disallow: ["/studio", "/api/", "/book/"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
      };

export default robots;
