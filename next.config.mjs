/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server components by default
  reactStrictMode: true,
  
  // Configure image domains for Sonar and OAuth providers
  images: {
    domains: [
      'sonar.perplexity.ai',
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub profile images
      'promptflow.io', // Our own domain for user uploads
      'storage.googleapis.com' // For GCS storage if used
    ],
    unoptimized: process.env.NODE_ENV === 'development', // Only optimize in production
  },
  
  // Handle ESLint during builds
  eslint: {
    // Only ignore during CI/CD builds if specified
    ignoreDuringBuilds: process.env.SKIP_ESLINT_DURING_BUILD === 'true',
  },
  
  // Handle TypeScript checking in builds
  typescript: {
    // Only ignore during CI/CD builds if specified
    ignoreBuildErrors: process.env.SKIP_TS_DURING_BUILD === 'true',
  },
  
  // Configure webpack to handle missing dependencies gracefully
  webpack: (config, { isServer }) => {
    // Optimize chunk size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 100000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'vendors',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Set up redirects
  async redirects() {
    return [
      // Redirect from old paths if needed
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  
  // Configure powered by header
  poweredByHeader: false,
};

export default nextConfig;
