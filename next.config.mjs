import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/modules': path.resolve(__dirname, './src/modules'),
    };
    return config;
  },
};

// Create a simple wrapper for withTM that works with ES modules
const withTM = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    if (nextConfig.webpack) {
      return nextConfig.webpack(config, options);
    }
    return config;
  },
});

export default withTM(nextConfig);
