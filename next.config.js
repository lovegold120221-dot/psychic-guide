const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "eburon.ai" },
    ],
  },
  webpack: (config, { isServer }) => {

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        buffer: false,
        process: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: false,
        process: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;


