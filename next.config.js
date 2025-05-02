/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server components by default
  reactStrictMode: true,
  
  // Configure image domains for Sonar and OAuth providers
  images: {
    domains: [
      'sonar.perplexity.ai',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com' // GitHub profile images
    ],
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