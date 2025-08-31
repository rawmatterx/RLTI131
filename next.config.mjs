/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
      '@/components': require('path').resolve(__dirname, './src/components'),
      '@/utils': require('path').resolve(__dirname, './src/utils'),
      '@/modules': require('path').resolve(__dirname, './src/modules'),
    };
    return config;
  },
}

const withTM = require('next-transpile-modules')([]);

module.exports = withTM(nextConfig);
