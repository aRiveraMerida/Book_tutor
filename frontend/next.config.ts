import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize images
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },

  // Experimental features
  experimental: {
    // Server actions for future use
  },
};

export default nextConfig;
