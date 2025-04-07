/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    unoptimized: true,
    domains: ['maps.googleapis.com']
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
    ]
  }
};

module.exports = nextConfig; 