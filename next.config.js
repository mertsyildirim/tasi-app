/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  images: {
    unoptimized: true,
    domains: ['tasiapp.com', 'portal.tasiapp.com', 'images.unsplash.com', 'via.placeholder.com']
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/musteri',
        destination: '/',
        has: [
          {
            type: 'host',
            value: 'tasiapp.com'
          }
        ]
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.gstatic.com;"
          }
        ],
      },
    ]
  },
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/admin': { page: '/admin' },
      '/admin/drivers': { page: '/admin/drivers' }
    }
  },
};

module.exports = nextConfig; 