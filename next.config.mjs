/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloud.fullcam.me',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'playerv.logicahost.com.br',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'www.giseleimoveis.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
