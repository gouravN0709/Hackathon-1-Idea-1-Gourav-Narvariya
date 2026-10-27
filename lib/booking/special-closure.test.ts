import { describe, expect, it } from "vitest";
import { closureBlocksBooking } from "@/lib/booking/special-closure";

describe("closureBlocksBooking", () => {
  const shiftA = "11111111-1111-4111-8111-111111111111";

  it("blocks whole-farm closures (null shift_id)", () => {
    expect(
      closureBlocksBooking([{ shift_id: null }], shiftA),
    ).toBe(true);
  });

  it("blocks when shift matches", () => {
    expect(
      closureBlocksBooking([{ shift_id: shiftA }], shiftA),
    ).toBe(true);
  });

  it("does not block when only another shift is closed", () => {
    expect(
      closureBlocksBooking(
        [{ shift_id: "22222222-2222-4222-8222-222222222222" }],
        shiftA,
      ),
    ).toBe(false);
  });

  it("does not block when no closures apply", () => {
    expect(closureBlocksBooking([], shiftA)).toBe(false);
  });
});
