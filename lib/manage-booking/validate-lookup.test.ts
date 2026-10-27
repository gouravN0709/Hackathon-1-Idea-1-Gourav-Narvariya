import { describe, expect, it } from "vitest";
import { formatReservationReference } from "@/lib/booking/reference";
import {
  guestLookupFieldErrors,
  validateGuestLookupInput,
} from "@/lib/manage-booking/validate-lookup";

describe("validateGuestLookupInput", () => {
  const reservationId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const reference = formatReservationReference(reservationId);

  it("accepts a valid reference and email", () => {
    const parsed = validateGuestLookupInput({
      reference,
      contact: "guest@example.com",
    });
    expect(parsed.ok).toBe(true);
  });

  it("rejects sample-style five-digit references", () => {
    expect(
      validateGuestLookupInput({
        reference: "ITU-12345",
        contact: "guest@example.com",
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid contact values", () => {
    expect(
      validateGuestLookupInput({
        reference,
        contact: "not-contact",
      }).ok,
    ).toBe(false);
  });
});

describe("guestLookupFieldErrors", () => {
  it("returns reference guidance for malformed references", () => {
    const errors = guestLookupFieldErrors({
      reference: "ITU-123",
      contact: "a@b.co",
    });
    expect(errors.reference).toBeTruthy();
    expect(errors.contact).toBeUndefined();
  });
});
