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
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com;
              style-src 'self' 'unsafe-inline' https://*.googleapis.com;
              img-src 'self' data: https://*.google.com https://*.googleapis.com https://*.gstatic.com;
              font-src 'self' https://*.gstatic.com;
              frame-src 'self' https://*.google.com;
              connect-src 'self' https://*.googleapis.com https://*.google.com;
            `
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig; 