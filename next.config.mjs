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
  // Increase the bodyParser size limit for API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase the maximum file upload size to 10MB
    },
  },
};

export default nextConfig;
