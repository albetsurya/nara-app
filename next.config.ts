import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Serwist compiles src/app/sw.ts -> public/sw.js and injects the precache manifest.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: false, // never reload while someone is mid-entry
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Trim client JS so BottomNav hydrates faster and Link prefetch starts sooner.
    optimizePackageImports: [
      "@fortawesome/fontawesome-svg-core",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/react-fontawesome",
      "@tanstack/react-query",
      "framer-motion",
    ],
  },
};

export default withSerwist(nextConfig);
