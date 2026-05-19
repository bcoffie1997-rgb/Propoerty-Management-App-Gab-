"use client";

import * as React from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

/**
 * PostHog client. Only initializes if NEXT_PUBLIC_POSTHOG_KEY is set —
 * leaving it blank in dev is fine.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: true,
      autocapture: true,
    });
  }, []);
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export { posthog };
