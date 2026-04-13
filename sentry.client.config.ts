import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Set sample rate for error events
  sampleRate: process.env.NODE_ENV === "production" ? 0.8 : 1.0,

  // Capture Replay for 10% of all sessions
  // plus, capture 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Settings for integrations
  integrations: [
    new Sentry.Replay({
      // Mask all text content entirely
      maskAllText: false,
      // Mask all inputs/select/textarea contents
      blockAllMedia: false,
    }),
  ],

  // Ignore errors from browser extensions and known third-party services
  ignoreErrors: [
    // Random plugins/extensions
    "top.GLOBALS",
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // https://github.com/getsentry/sentry-javascript/issues/3440
    "chrome://",
    "moz-extension://",
    "edge://",
  ],

  beforeSend(event) {
    // Filter out error events during development
    if (process.env.NODE_ENV === "development" && event.level === "error") {
      return null;
    }
    return event;
  },
});
