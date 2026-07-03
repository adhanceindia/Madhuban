import * as Sentry from "@sentry/nextjs";

try {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    enableLogs: true,
  });
} catch (error) {
  console.error('[Sentry] Failed to initialize edge config:', error);
}
