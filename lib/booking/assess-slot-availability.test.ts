import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/booking/readiness", () => ({
  assessBookingReadiness: vi.fn(),
}));

vi.mock("@/lib/booking/resolve-shift", () => ({
  resolveShiftIdForBooking: vi.fn(),
}));

vi.mock("@/lib/booking/special-closure", () => ({
  checkBookingClosedForShift: vi.fn(),
  CLOSURE_BOOKING_MESSAGE: "That date is not open for booking.",
}));

import { assessBookingReadiness } from "@/lib/booking/readiness";
import { resolveShiftIdForBooking } from "@/lib/booking/resolve-shift";
import { checkBookingClosedForShift } from "@/lib/booking/special-closure";
import { assessBookingSlotAvailability } from "@/lib/booking/assess-slot-availability";

const supabase = {} as SupabaseClient;

describe("assessBookingSlotAvailability", () => {
  beforeEach(() => {
    vi.mocked(assessBookingReadiness).mockReset();
    vi.mocked(resolveShiftIdForBooking).mockReset();
    vi.mocked(checkBookingClosedForShift).mockReset();
  });

  it("rejects invalid service dates", async () => {
    const result = await assessBookingSlotAvailability(supabase, "not-a-date", "13:00");
    expect(result.bookable).toBe(false);
    if (!result.bookable) {
      expect(result.message.length).toBeGreaterThan(0);
    }
    expect(assessBookingReadiness).not.toHaveBeenCalled();
  });

  it("rejects unknown arrival times", async () => {
    const result = await assessBookingSlotAvailability(supabase, "2026-11-06", "12:00");
    expect(result).toEqual({ bookable: false, message: "Choose an arrival time." });
  });

  it("returns readiness reason when booking is not live", async () => {
    vi.mocked(assessBookingReadiness).mockResolvedValue({
      live: false,
      reason: "Active service shifts for cellar days are not configured in the database.",
    });

    const result = await assessBookingSlotAvailability(supabase, "2026-11-06", "13:00");
    expect(result).toEqual({
      bookable: false,
      message: "Active service shifts for cellar days are not configured in the database.",
    });
    expect(resolveShiftIdForBooking).not.toHaveBeenCalled();
  });

  it("returns not open when no shift resolves", async () => {
    vi.mocked(assessBookingReadiness).mockResolvedValue({ live: true, reason: null });
    vi.mocked(resolveShiftIdForBooking).mockResolvedValue(null);

    const result = await assessBookingSlotAvailability(supabase, "2026-11-06", "13:30");
    expect(result).toEqual({
      bookable: false,
      message: "That date or arrival time is not open for booking.",
    });
  });

  it("returns closure message when shift is closed", async () => {
    vi.mocked(assessBookingReadiness).mockResolvedValue({ live: true, reason: null });
    vi.mocked(resolveShiftIdForBooking).mockResolvedValue("shift-id");
    vi.mocked(checkBookingClosedForShift).mockResolvedValue("closed");

    const result = await assessBookingSlotAvailability(supabase, "2026-11-06", "14:00");
    expect(result).toEqual({
      bookable: false,
      message: "That date is not open for booking.",
    });
  });

  it("returns bookable when live, shift exists, and not closed", async () => {
    vi.mocked(assessBookingReadiness).mockResolvedValue({ live: true, reason: null });
    vi.mocked(resolveShiftIdForBooking).mockResolvedValue("shift-id");
    vi.mocked(checkBookingClosedForShift).mockResolvedValue("open");

    const result = await assessBookingSlotAvailability(supabase, "2026-11-06", "14:00");
    expect(result).toEqual({ bookable: true });
  });
});
