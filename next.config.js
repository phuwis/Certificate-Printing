/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "moi.go.th",
      },
    ],
  },
};

module.exports = nextConfig;
