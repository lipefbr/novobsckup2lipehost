import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin dev preview requests (sandbox/preview environments)
  allowedDevOrigins: [
    "https://preview-chat-be9227f4-91b3-45ec-85ce-7f2d1edfa80a.space-z.ai",
    "*.space-z.ai",
  ],
  // Compress responses
  compress: true,
  // Power by header
  poweredByHeader: false,
  // Image config
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  // Async headers for security + SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
