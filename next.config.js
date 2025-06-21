/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'a0.muscache.com'],
  },
  // Environment variables are automatically available in Vercel
  // No need to explicitly define them in next.config.js
}

module.exports = nextConfig 