const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      require('remark-gfm'),
      require('remark-math'),
    ],
    rehypePlugins: [
      [require('rehype-highlight'), { subset: false }],
      require('rehype-katex'),
    ],
    providerImportSource: '@mdx-js/react',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,

  // Static export for Cloudflare Pages
  output: 'export',
  trailingSlash: true,

  experimental: {
    optimizePackageImports: ['d3', 'three', 'framer-motion'],
    mdxRs: true,
  },

  // MDX page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Image optimization for educational content
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ailearning.devninja.in',
      },
    ],
    formats: ['image/avif', 'image/webp'],
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

module.exports = withMDX(nextConfig);
