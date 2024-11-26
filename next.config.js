/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Добавляем настройки webpack для поддержки transpilePackages если нужно
  transpilePackages: ['@mui/material', '@mui/icons-material'],
};

module.exports = nextConfig;