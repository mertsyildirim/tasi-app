/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  images: {
    unoptimized: true,
    domains: ['tasiapp.com', 'portal.tasiapp.com']
  },
  typescript: {
    ignoreBuildErrors: true,
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
      },
      {
        source: '/',
        destination: '/portal/login',
        has: [
          {
            type: 'host',
            value: 'portal.tasiapp.com'
          }
        ]
      },
      {
        source: '/portal',
        destination: '/portal/login',
        has: [
          {
            type: 'host',
            value: 'portal.tasiapp.com'
          }
        ]
      },
      {
        source: '/dashboard',
        destination: '/portal/dashboard',
        has: [
          {
            type: 'host',
            value: 'portal.tasiapp.com'
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
            value: `frame-ancestors 'self';
                   script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;
                   img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.gstatic.com;`
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig; 