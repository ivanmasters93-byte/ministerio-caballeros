import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@whiskeysockets/baileys',
    'qrcode',
    'better-sqlite3',
  ],
};

export default nextConfig;
