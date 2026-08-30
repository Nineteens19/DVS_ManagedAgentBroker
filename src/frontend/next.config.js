/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['localhost', 'avatar.vercel.sh'],
    unoptimized: true
  },
};

module.exports = nextConfig;
