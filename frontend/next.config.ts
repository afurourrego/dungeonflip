import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore optional modules that are not installed
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      '@gemini-wallet/core',
      'porto',
      'porto/internal'
    );
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    // Ignore test files that live inside node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules\/.*\.(test|spec)\.(js|ts|mjs)$/,
      use: 'ignore-loader',
    });
    
    // Ignore optional imports that may fail to resolve
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^(@gemini-wallet\/core|porto(\/internal)?|@react-native-async-storage\/async-storage)$/,
      })
    );
    
    return config;
  },
  transpilePackages: ['@walletconnect/ethereum-provider'],
};

export default nextConfig;
