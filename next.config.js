/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/googlesheets',
        destination: 'http://localhost:3001/api/googlesheets',
      },
      {
        source: '/api/health',
        destination: 'http://localhost:3001/health',
      }
    ];
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
};

module.exports = nextConfig;