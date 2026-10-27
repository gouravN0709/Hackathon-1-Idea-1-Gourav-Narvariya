import { describe, expect, it } from "vitest";
import { formatReservationReference } from "@/lib/booking/reference";
import {
  normalizeReferenceQuery,
  reservationMatchesReference,
} from "@/lib/staff/reference-match";

describe("normalizeReferenceQuery", () => {
  it("trims and uppercases", () => {
    expect(normalizeReferenceQuery("  itu-abc  ")).toBe("ITU-ABC");
  });
});

describe("reservationMatchesReference", () => {
  const reservationId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  it("matches the formatted reference", () => {
    const reference = formatReservationReference(reservationId);
    expect(reservationMatchesReference(reservationId, reference)).toBe(true);
  });

  it("matches a partial prefix without the ITU- prefix", () => {
    expect(reservationMatchesReference(reservationId, "A1B2C3D4E5")).toBe(true);
  });

  it("returns true for an empty query", () => {
    expect(reservationMatchesReference(reservationId, "")).toBe(true);
  });

  it("rejects unrelated references", () => {
    expect(reservationMatchesReference(reservationId, "ITU-0000000000")).toBe(
      false,
    );
  });
});
