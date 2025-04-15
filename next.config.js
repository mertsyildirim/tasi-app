/** @type {import('next').NextConfig} */
const path = require('path');

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
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    const paths = { ...defaultPathMap };
    
    delete paths['/portal/upload-documents'];
    delete paths['/services/express'];
    delete paths['/services/koli'];
    delete paths['/services/kurye'];
    delete paths['/services/palet'];
    delete paths['/services/parsiyel'];
    
    return paths;
  },
};

module.exports = nextConfig; 