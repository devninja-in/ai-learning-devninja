/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  // Static export for Cloudflare Pages
  output: 'export',
  trailingSlash: true,

  experimental: {
    optimizePackageImports: ['d3', 'three', 'framer-motion'],
  },

  // Standard page extensions for React components
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Performance optimizations for educational content
  poweredByHeader: false,
  compress: true,

  // Webpack configuration for D3 and visualization libraries
  webpack: (config, { dev, isServer }) => {
    // Optimize for D3 and data visualization libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Security headers now handled by public/_headers for Cloudflare Pages
};

module.exports = nextConfig;
