import { getRateLimitStore } from "@/lib/api/rate-limit-store";

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  return await getRateLimitStore().check(key, limit, windowMs, now);
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}
