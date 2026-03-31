/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['groq-sdk'],
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
        config.resolve.symlinks = false;
    }
    return config;
  },
};

export default nextConfig;
