import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  defaults: "2025-05-24",
});
