/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'railway.app']
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/portal/login',
      },
      {
        source: '/portal',
        destination: '/portal/login',
      },
      {
        source: '/dashboard',
        destination: '/portal/dashboard',
      },
      {
        source: '/admin',
        destination: '/admin/login',
      }
    ];
  },
  output: 'standalone',
  experimental: {
    serverActions: true
  }
};

module.exports = nextConfig; 