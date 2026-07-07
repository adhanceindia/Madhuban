import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.consoleLoggingIntegration({
      levels: ["warn", "error"],
    }),
  ],
  dataCollection: {},
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  profileSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  profileLifecycle: "trace",
  includeLocalVariables: true,
  enableLogs: true,
});
