import { describe, expect, it } from "vitest";
import { checkRateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the limit", async () => {
    const key = `test-${Math.random()}`;
    expect((await checkRateLimit(key, 2, 60_000, 1_000)).ok).toBe(true);
    expect((await checkRateLimit(key, 2, 60_000, 2_000)).ok).toBe(true);
  });

  it("blocks after the limit is exceeded", async () => {
    const key = `test-${Math.random()}`;
    expect((await checkRateLimit(key, 1, 60_000, 10_000)).ok).toBe(true);
    const blocked = await checkRateLimit(key, 1, 60_000, 11_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });
});

describe("clientIpFromRequest", () => {
  it("uses the first x-forwarded-for hop", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(clientIpFromRequest(request)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(
      clientIpFromRequest(
        new Request("https://example.com", { headers: { "x-real-ip": "198.51.100.2" } }),
      ),
    ).toBe("198.51.100.2");
    expect(clientIpFromRequest(new Request("https://example.com"))).toBe("unknown");
  });
});
