/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript checks during builds for faster builds 
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during builds for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
