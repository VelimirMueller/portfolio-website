interface RateLimiterOptions {
  windowMs: number;
  max: number;
  /** Evict expired buckets once the map grows past this size. */
  maxKeys?: number;
}

/**
 * Fixed-window in-memory rate limiter. State is per server instance, so on
 * serverless this is best-effort (instances are reused under load, which is
 * exactly when limiting matters) — not a substitute for a platform-level rule.
 */
export function createRateLimiter({ windowMs, max, maxKeys = 500 }: RateLimiterOptions) {
  const buckets = new Map<string, { count: number; windowStart: number }>();

  return function check(key: string, now: number = Date.now()): boolean {
    if (buckets.size >= maxKeys) {
      for (const [k, bucket] of buckets) {
        if (now - bucket.windowStart >= windowMs) buckets.delete(k);
      }
    }

    const bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return true;
    }
    if (bucket.count >= max) return false;
    bucket.count += 1;
    return true;
  };
}

/** 5 submissions per IP per 10 minutes — generous for humans, hostile to scripts. */
export const checkContactRateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
});
