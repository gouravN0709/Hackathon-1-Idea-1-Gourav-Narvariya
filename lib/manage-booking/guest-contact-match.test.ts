import { describe, expect, it } from "vitest";
import { guestContactMatches } from "@/lib/manage-booking/guest-contact-match";

describe("guestContactMatches", () => {
  const stored = { email: "ana@example.com", phone: "+34 945 123 456" };

  it("matches email case-insensitively", () => {
    expect(guestContactMatches("Ana@Example.com", stored)).toBe(true);
  });

  it("matches phone by digits", () => {
    expect(guestContactMatches("945123456", stored)).toBe(true);
  });

  it("rejects mismatched contact", () => {
    expect(guestContactMatches("other@example.com", stored)).toBe(false);
    expect(guestContactMatches("600000000", stored)).toBe(false);
  });
});
