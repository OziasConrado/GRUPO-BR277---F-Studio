/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the preview server.
    allowedDevOrigins: [
      'https://*.cluster-etsqrqvqyvd4erxx7qq32imrjk.cloudworkstations.dev',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
