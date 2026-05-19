import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/api/pdf': ['./public/forms/**', './public/fonts/**'],
  },
};

export default nextConfig;
