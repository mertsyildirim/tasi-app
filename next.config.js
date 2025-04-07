/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  images: {
    unoptimized: true,
    domains: ['maps.googleapis.com']
  }
};

module.exports = nextConfig; 