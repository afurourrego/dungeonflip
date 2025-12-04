import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignorar módulos opcionales que no están instalados
    config.externals.push('pino-pretty', 'lokijs', 'encoding', '@gemini-wallet/core', 'porto');
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    
    // Ignorar archivos de test en node_modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules\/.*\.(test|spec)\.(js|ts|mjs)$/,
      use: 'ignore-loader',
    });
    
    // Ignorar imports opcionales que fallan
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^(@gemini-wallet\/core|porto|@react-native-async-storage\/async-storage)$/,
      })
    );
    
    return config;
  },
  transpilePackages: ['@walletconnect/ethereum-provider'],
};

export default nextConfig;
