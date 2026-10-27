import { describe, expect, it } from "vitest";
import { validateGuestCancelInput } from "@/lib/manage-booking/guest-cancel";
import { formatReservationReference } from "@/lib/booking/reference";

describe("validateGuestCancelInput", () => {
  const reference = formatReservationReference("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

  it("requires updatedAt", () => {
    const result = validateGuestCancelInput({
      reference,
      contact: "guest@example.com",
      updatedAt: "",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects unknown reasons", () => {
    const result = validateGuestCancelInput({
      reference,
      contact: "guest@example.com",
      updatedAt: "2026-01-01T00:00:00.000Z",
      reason: "unknown",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts optional reason and message", () => {
    const result = validateGuestCancelInput({
      reference,
      contact: "guest@example.com",
      updatedAt: "2026-01-01T00:00:00.000Z",
      reason: "travel",
      message: "Flight moved to Monday.",
    });
    expect(result.ok).toBe(true);
  });
});
