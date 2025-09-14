/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable strict mode for client components
    esmExternals: "loose",
    forceSwcTransforms: true,
  },
  // Disable webpack's default serialization checks
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Transpile ReactFlow
  transpilePackages: [
    "reactflow",
    "@reactflow/core",
    "@reactflow/controls",
    "@reactflow/background",
    "@reactflow/minimap",
  ],

  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
