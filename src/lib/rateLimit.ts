const ipRequests = new Map<string, number[]>();

const MAX_REQUESTS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) ?? [];

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    ipRequests.set(ip, valid);
    return { allowed: false, remaining: 0 };
  }

  valid.push(now);
  ipRequests.set(ip, valid);
  return { allowed: true, remaining: MAX_REQUESTS - valid.length };
}

// Cleanup old entries every 10 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRequests.entries()) {
      const valid = timestamps.filter((t) => now - t < WINDOW_MS);
      if (valid.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, valid);
      }
    }
  };
  setInterval(cleanup, 10 * 60 * 1000);
}
