/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    domains: ["images.unsplash.com", "a0.muscache.com"],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,

  },
  // Environment variables are automatically available in Vercel
  // No need to explicitly define them in next.config.js
};
module.exports = nextConfig;

