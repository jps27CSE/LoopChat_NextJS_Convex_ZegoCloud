import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "cheery-stingray-973.convex.cloud" }],
  },
};

export default nextConfig;
