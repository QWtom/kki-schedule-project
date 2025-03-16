/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['googleapis']
  }
};

module.exports = nextConfig;