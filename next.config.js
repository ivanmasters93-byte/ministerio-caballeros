/** @type {import('next').NextConfig} */

let withSentryConfig;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  withSentryConfig = require('@sentry/nextjs').withSentryConfig;
} catch {
  // Sentry not installed, skip
}

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

// Only apply Sentry config if installed and credentials are available
const config = withSentryConfig && process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  : nextConfig;

module.exports = config;
