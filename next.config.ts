import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация Turbopack и сборки
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'oczgmziyucrcxhkzmipx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'bqpmlyaqipxbydgfdiut.supabase.co',
      },
    ],
  },
};

export default nextConfig;
