"use client";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 event. Gracefully no-ops if gtag isn't loaded.
 */
export function trackEvent(name: string, params?: EventParams): void {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", name, params);
    }
  } catch {
    // Analytics should never break the app
  }
}
