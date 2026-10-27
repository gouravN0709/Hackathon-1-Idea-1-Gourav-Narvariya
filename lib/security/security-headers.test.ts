import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS } from "@/lib/security/security-headers";

describe("SECURITY_HEADERS", () => {
  it("includes baseline hardening headers", () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Strict-Transport-Security");
  });

  it("does not allow framing", () => {
    const frame = SECURITY_HEADERS.find((h) => h.key === "X-Frame-Options");
    expect(frame?.value).toBe("DENY");
  });
});
