import type { MetadataRoute } from "next";
import { isSeoPreview, siteUrl } from "@/lib/seo/config";
export const dynamic = "force-dynamic";
export default function robots(): MetadataRoute.Robots {
  return isSeoPreview()
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: `${siteUrl}/sitemap.xml`,
      };
}
