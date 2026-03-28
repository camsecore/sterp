import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.sterp.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "images.sterp.com" }],
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-photos/:path*`,
      },
    ];
  },
};

export default nextConfig;
