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
};

export default nextConfig;
