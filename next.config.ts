import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import { resolveCanonicalSiteUrl } from "./src/lib/localOrigin";

const siteUrl = resolveCanonicalSiteUrl();

/** App root for output file tracing when a parent directory has another lockfile (Next.js monorepo warning). */
const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: appRoot,
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
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
