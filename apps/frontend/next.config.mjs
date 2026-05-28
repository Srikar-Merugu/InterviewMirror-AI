/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  output: "standalone",
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
