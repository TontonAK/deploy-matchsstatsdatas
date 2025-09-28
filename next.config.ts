import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://img.matchsstatslivecdn.com/clubs/**"),
      new URL("https://img.matchsstatslivecdn.com/players/*/**"),
      new URL("https://img.matchsstatslivecdn.com/players/**"),
    ],
  },
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
