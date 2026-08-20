import type { NextConfig } from "next";

const LEGACY_LOCALES = "(en|it|zh|ja)";

const nextConfig: NextConfig = {
  typedRoutes: false,
  cacheComponents: true,
  // Blog cache-life profile: serve stale for an hour while revalidating in
  // the background, fall back to a full revalidation every day, hard-expire
  // after 30 days. A Sanity webhook (app/api/revalidate) busts the cache
  // immediately when content changes.
  cacheLife: {
    blog: {
      stale: 60 * 60,
      revalidate: 60 * 60 * 24,
      expire: 60 * 60 * 24 * 30,
    },
  },
  images: {
    qualities: [60, 66, 72, 75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  async redirects() {
    return [
      // Bare locale prefix (e.g. /en, /it) redirects to the homepage.
      {
        source: `/:locale${LEGACY_LOCALES}`,
        destination: "/",
        permanent: true,
      },
      // Old localized URLs (e.g. /en/about, /it/foo/bar) permanently redirect
      // to their locale-less canonical path, preserving the rest of the path
      // and any query string.
      {
        source: `/:locale${LEGACY_LOCALES}/:path+`,
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
