import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    // /book/* is the checkout and confirmation flow. Both also send
    // `noindex` in their metadata; this stops the crawl budget being spent on
    // them in the first place.
    disallow: ["/studio", "/api/", "/book/"],
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
