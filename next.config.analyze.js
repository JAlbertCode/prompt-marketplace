/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@vercel/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Import the base config
const baseConfig = require('./next.config.js');

// Combine the configurations
const config = {
  ...baseConfig,
  // Add any analyzer-specific configurations here
};

module.exports = withBundleAnalyzer(config);
