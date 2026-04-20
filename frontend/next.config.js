/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.BACKEND_INTERNAL_URL || "http://backend:8000";
    return [
      {
        source: "/socket.io/:path*",
        destination: `${backend}/socket.io/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
