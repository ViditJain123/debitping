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
  // Configure API routes
  serverRuntimeConfig: {
    // These settings will be accessible only on the server side
    maxBodySize: '10mb', // Maximum request body size for API routes
  },
};

export default nextConfig;
