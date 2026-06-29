import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  typedRoutes: false,
  images: {
    qualities: [60, 66, 72, 75, 80],
  },
};

export default withNextIntl(nextConfig);
