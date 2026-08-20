import type { NextConfig } from "next";

const LEGACY_LOCALES = "(en|it|zh|ja)";

const nextConfig: NextConfig = {
  typedRoutes: false,
  cacheComponents: true,
  images: {
    qualities: [60, 66, 72, 75, 80],
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
