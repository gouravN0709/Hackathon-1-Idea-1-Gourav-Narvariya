import { describe, expect, it } from "vitest";
import { formatReservationReference } from "@/lib/booking/reference";
import { referenceToUuidIlikePrefix } from "@/lib/manage-booking/reference-prefix";

describe("referenceToUuidIlikePrefix", () => {
  it("maps a formatted reference to a UUID prefix", () => {
    const id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const reference = formatReservationReference(id);
    expect(referenceToUuidIlikePrefix(reference)).toBe("a1b2c3d4-e5");
  });

  it("returns null for invalid references", () => {
    expect(referenceToUuidIlikePrefix("ITU-12345")).toBeNull();
  });
});
