import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: true,
  },
  headers: async () => [
    {
      source: "/manifest.json",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=604800, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
