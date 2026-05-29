/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Autorise l'affichage des médias hébergés sur Supabase Storage.
        // Remplacé automatiquement par votre projet via la variable d'env.
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
