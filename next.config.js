const nextConfig = {
  /* config options here */
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_GROQ_API_KEY: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    NEXT_PUBLIC_GROQ_API_URL: process.env.NEXT_PUBLIC_GROQ_API_URL,
    NEXT_PUBLIC_GROQ_MODEL: process.env.NEXT_PUBLIC_GROQ_MODEL,
  },
  // Configure webpack to handle browser-only dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to import Node.js specific modules on the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        async_hooks: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
