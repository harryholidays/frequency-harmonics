/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: {
      // Temporarily disable TypeScript build errors during deployment
      ignoreBuildErrors: true
    },
    eslint: {
      // Temporarily disable ESLint build errors during deployment
      ignoreDuringBuilds: true
    }
  }
  
  module.exports = nextConfig