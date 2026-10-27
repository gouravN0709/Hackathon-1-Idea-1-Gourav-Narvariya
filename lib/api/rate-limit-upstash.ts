import { Redis } from "@upstash/redis";

import type { RateLimitStore, RateLimitStoreResult } from "@/lib/api/rate-limit-store";

export type UpstashRedisConfig = {
  url: string;
  token: string;
};

export function readUpstashRedisConfig(): UpstashRedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return null;
  }
  return { url, token };
}

/** Fixed-window counter shared across app instances (Upstash Redis REST). */
export function createUpstashRateLimitStore(config: UpstashRedisConfig): RateLimitStore {
  const redis = new Redis({ url: config.url, token: config.token });

  return {
    async check(key, limit, windowMs, now): Promise<RateLimitStoreResult> {
      const redisKey = `ratelimit:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.pexpire(redisKey, windowMs);
      }

      if (count > limit) {
        const ttlMs = await redis.pttl(redisKey);
        const retryMs = ttlMs > 0 ? ttlMs : windowMs - (now % windowMs);
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
        };
      }

      return { ok: true };
    },
  };
}
