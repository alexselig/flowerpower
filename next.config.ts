import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/flowerpower") when building for a GitHub
// Pages project site; leave unset for local dev / root hosting.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
