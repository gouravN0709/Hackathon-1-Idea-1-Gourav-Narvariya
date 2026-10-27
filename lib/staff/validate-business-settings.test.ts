import { describe, expect, it } from "vitest";
import {
  isSupportedIanaTimezone,
  validateBusinessTimezoneInput,
} from "@/lib/staff/validate-business-settings";

describe("validateBusinessTimezoneInput", () => {
  it("accepts Europe/Madrid", () => {
    const result = validateBusinessTimezoneInput({ timezone: "Europe/Madrid" });
    expect(result.ok).toBe(true);
  });

  it("rejects empty and bogus values", () => {
    expect(validateBusinessTimezoneInput({ timezone: "" }).ok).toBe(false);
    expect(validateBusinessTimezoneInput({ timezone: "Not/A/Zone" }).ok).toBe(false);
  });

  it("isSupportedIanaTimezone enforces length bounds", () => {
    expect(isSupportedIanaTimezone("")).toBe(false);
    expect(isSupportedIanaTimezone("x".repeat(65))).toBe(false);
  });
});
