/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server components by default
  reactStrictMode: true,
  
  // Configure image domains if we need to load images from Sonar
  images: {
    domains: ['sonar.perplexity.ai'],
  },
  
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configure webpack to handle missing dependencies gracefully
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
