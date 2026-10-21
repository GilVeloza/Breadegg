type Gtag = (...args: unknown[]) => void;

/**
 * Sends a Google Analytics event. gtag only exists once the visitor has said
 * yes to analytics, so before that, or without a measurement ID, this does
 * nothing at all.
 */
export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag?: Gtag }).gtag?.("event", event, params);
}
