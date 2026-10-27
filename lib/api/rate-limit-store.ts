/**
 * Rate-limit storage backends.
 *
 * Production note: the default in-memory store is per Node process only. On
 * multi-instance hosts (several containers or serverless workers), each instance
 * maintains its own counters, so effective limits are multiplied by instance count
 * and counters reset on cold starts. For distributed protection, plug in a shared
 * store (Redis, Upstash, Vercel KV, etc.) via `RATE_LIMIT_BACKEND=distributed`
 * once credentials and infrastructure exist — see docs/operations-setup.md.
 */

export type RateLimitStoreResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export type RateLimitStore = {
  check(key: string, limit: number, windowMs: number, now: number): RateLimitStoreResult;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export function createInMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, Bucket>();

  return {
    check(key, limit, windowMs, now) {
      const existing = buckets.get(key);
      if (!existing || now >= existing.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true };
      }

      if (existing.count >= limit) {
        return {
          ok: false,
          retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
      }

      existing.count += 1;
      return { ok: true };
    },
  };
}

export type RateLimitBackendReport =
  | { mode: "memory" }
  | { mode: "distributed_requested"; effective: "memory"; note: string };

/** For health checks and ops docs — no credentials exposed. */
export function describeRateLimitBackend(): RateLimitBackendReport {
  const flag = process.env.RATE_LIMIT_BACKEND?.trim();
  if (flag === "distributed") {
    const wired = createDistributedRateLimitStore();
    if (!wired) {
      return {
        mode: "distributed_requested",
        effective: "memory",
        note: "RATE_LIMIT_BACKEND=distributed is set but no shared store is wired; limits are per instance.",
      };
    }
    return {
      mode: "distributed_requested",
      effective: "memory",
      note: "Distributed store returned unexpectedly; verify adapter configuration.",
    };
  }
  return { mode: "memory" };
}

/** Placeholder for a future Redis/KV adapter — not active without env + credentials. */
export function createDistributedRateLimitStore(): RateLimitStore | null {
  const flag = process.env.RATE_LIMIT_BACKEND?.trim();
  if (flag !== "distributed") {
    return null;
  }
  // No shared store is wired yet; fall back safely rather than failing open with a stub network call.
  return null;
}

let defaultStore: RateLimitStore | null = null;

export function getRateLimitStore(): RateLimitStore {
  if (!defaultStore) {
    defaultStore = createDistributedRateLimitStore() ?? createInMemoryRateLimitStore();
  }
  return defaultStore;
}

/** Test hook to reset the singleton between cases. */
export function resetRateLimitStoreForTests(): void {
  defaultStore = null;
}
