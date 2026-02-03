import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typeScript: {
    ignoreBuildErrors: false,
  },
  cacheComponents: true,
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ]
   }
};

export default nextConfig;
