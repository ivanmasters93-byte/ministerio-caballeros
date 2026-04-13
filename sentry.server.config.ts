import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set sample rate for error events
  sampleRate: process.env.NODE_ENV === "production" ? 0.8 : 1.0,

  // Server-side specific settings
  serverName: process.env.VERCEL_DEPLOYMENT_ID || "ministerio-caballeros-server",

  // Ignore errors
  ignoreErrors: [
    // Network errors that are expected
    "NetworkError",
    "TimeoutError",
  ],

  // Integrations
  integrations: [],

  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }

    // Don't send development errors in production
    if (process.env.NODE_ENV === "production" && event.level === "debug") {
      return null;
    }

    return event;
  },
});
