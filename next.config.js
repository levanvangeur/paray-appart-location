/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Augmenter la limite du body pour l'upload de photos (base64 ~33% plus lourd)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
}
module.exports = nextConfig
