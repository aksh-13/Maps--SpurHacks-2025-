/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "a0.muscache.com", "images.ticketmaster.com"],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
};

module.exports = nextConfig;

