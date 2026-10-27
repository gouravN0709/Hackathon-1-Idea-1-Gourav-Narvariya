import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import type { VerifiedGuestReservation } from "@/lib/manage-booking/lookup-reservation";

vi.mock("@/lib/manage-booking/lookup-reservation", () => ({
  lookupGuestReservation: vi.fn(),
}));

import { lookupGuestReservation } from "@/lib/manage-booking/lookup-reservation";
import { cancelGuestReservation } from "@/lib/manage-booking/guest-cancel";

const reservationId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const reference = formatReservationReference(reservationId);
const updatedAt = "2026-01-01T12:00:00.000Z";

function verified(overrides: Partial<VerifiedGuestReservation["summary"]> = {}): VerifiedGuestReservation {
  return {
    reservationId,
    notes: null,
    summary: {
      reference,
      guestDisplayName: "Guest",
      serviceDate: "2026-11-06",
      serviceDateLabel: "6 Nov 2026",
      arrivalTime: "13:30",
      adultCount: 2,
      childCount: 0,
      partySize: 2,
      status: "confirmed",
      shiftName: "Lunch",
      tableLabels: [],
      canCancel: true,
      cancelBlockedReason: null,
      updatedAt,
      ...overrides,
    },
  };
}

const supabase = {} as SupabaseClient;

describe("cancelGuestReservation", () => {
  beforeEach(() => {
    vi.mocked(lookupGuestReservation).mockReset();
  });

  it("returns not_found when lookup fails", async () => {
    vi.mocked(lookupGuestReservation).mockResolvedValue(null);

    const result = await cancelGuestReservation(supabase, {
      reference,
      contact: "guest@example.com",
      updatedAt,
    });

    expect(result).toEqual({
      ok: false,
      code: "not_found",
      message: "We could not verify this booking. Check the reference and contact details.",
    });
  });

  it("returns conflict when updatedAt is stale", async () => {
    vi.mocked(lookupGuestReservation).mockResolvedValue(
      verified({ updatedAt: "2026-01-02T00:00:00.000Z" }),
    );

    const result = await cancelGuestReservation(supabase, {
      reference,
      contact: "guest@example.com",
      updatedAt,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("conflict");
    }
  });

  it("returns idempotent success when already cancelled", async () => {
    vi.mocked(lookupGuestReservation).mockResolvedValue(
      verified({ status: "cancelled", canCancel: false }),
    );

    const result = await cancelGuestReservation(supabase, {
      reference,
      contact: "guest@example.com",
      updatedAt,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.idempotent).toBe(true);
    }
  });

  it("returns ineligible for seated status", async () => {
    vi.mocked(lookupGuestReservation).mockResolvedValue(
      verified({ status: "seated", canCancel: false, cancelBlockedReason: "Already seated." }),
    );

    const result = await cancelGuestReservation(supabase, {
      reference,
      contact: "guest@example.com",
      updatedAt,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("ineligible");
    }
  });
});
