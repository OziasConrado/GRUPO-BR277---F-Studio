/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Adicionado para suportar logos de concessionárias se necessário no futuro
      {
        protocol: 'https',
        hostname: 'playerv.logicahost.com.br',
      },
      {
          protocol: 'https',
          hostname: 'www.giseleimoveis.com.br',
      },
    ],
  },
};

export default nextConfig;
