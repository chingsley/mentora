import type { NextConfig } from "next";
import { resolveCanonicalSiteUrl } from "./src/lib/localOrigin";

const siteUrl = resolveCanonicalSiteUrl();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: siteUrl,
    AUTH_URL: siteUrl,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  compiler: {
    // Enables SSR + className minification for styled-components.
    styledComponents: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
