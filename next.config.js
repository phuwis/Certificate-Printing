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
  output: "export",
};

module.exports = nextConfig;
