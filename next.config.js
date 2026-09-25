/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
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
