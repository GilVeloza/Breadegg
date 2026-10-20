// A crude per-instance throttle. It won't survive a cold start, but it costs
// nothing and stops the obvious flooding; the honeypots catch the rest.
const WINDOW_MS = 60_000;

export function throttle(maxPerWindow: number) {
  const seen = new Map<string, number[]>();
  return function throttled(request: Request): boolean {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const now = Date.now();
    const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    hits.push(now);
    seen.set(ip, hits);
    return hits.length > maxPerWindow;
  };
}
