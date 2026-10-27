import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase/admin", () => ({
  hasServiceRoleConfiguration: () => true,
}));

import { assessBookingReadiness, evaluateSeatingCapacityReadiness } from "@/lib/booking/readiness";

function cellarLunchShift(dayOfWeek: number, maxCovers: number) {
  return {
    day_of_week: dayOfWeek,
    starts_at: "13:00:00",
    ends_at: "16:00:00",
    is_active: true,
    max_covers: maxCovers,
  };
}

describe("evaluateSeatingCapacityReadiness", () => {
  it("fails when active table seating is empty", () => {
    const result = evaluateSeatingCapacityReadiness([cellarLunchShift(4, 40)], 0);

    expect(result).toEqual({
      live: false,
      reason:
        "No active table seating is configured. Add active dining tables with seat counts before online booking can go live.",
    });
  });

  it("fails when a bookable shift max_covers exceeds total active seats", () => {
    const result = evaluateSeatingCapacityReadiness([cellarLunchShift(4, 500)], 40);

    expect(result?.live).toBe(false);
    expect(result?.reason).toContain("more covers than active table seating");
    expect(result?.reason).toContain("40 seats");
  });

  it("passes when max_covers is within total active seating", () => {
    const result = evaluateSeatingCapacityReadiness(
      [
        cellarLunchShift(4, 40),
        cellarLunchShift(5, 36),
        cellarLunchShift(6, 40),
        cellarLunchShift(7, 40),
      ],
      40,
    );

    expect(result).toBeNull();
  });

  it("ignores inactive shifts that exceed seating when not bookable", () => {
    const result = evaluateSeatingCapacityReadiness(
      [
        {
          day_of_week: 4,
          starts_at: "13:00:00",
          ends_at: "16:00:00",
          is_active: false,
          max_covers: 500,
        },
        cellarLunchShift(4, 30),
      ],
      40,
    );

    expect(result).toBeNull();
  });
});

function mockReadinessSupabase(options: {
  shifts: ReturnType<typeof cellarLunchShift>[] | { day_of_week: number; starts_at: string; ends_at: string; is_active: boolean; max_covers: number }[];
  tableSeatCounts: number[];
}) {
  return {
    from(table: string) {
      if (table === "business_settings") {
        return {
          select: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: { timezone: "Europe/Madrid" }, error: null }),
            }),
          }),
        };
      }

      if (table === "weekly_hours") {
        return {
          select: async () => ({
            data: [4, 5, 6, 7].map((day_of_week) => ({
              day_of_week,
              opens_at: "13:00:00",
              closes_at: "16:00:00",
            })),
            error: null,
          }),
        };
      }

      if (table === "service_shifts") {
        return {
          select: async () => ({
            data: options.shifts,
            error: null,
          }),
        };
      }

      if (table === "restaurant_tables") {
        return {
          select: () => ({
            eq: async () => ({
              data: options.tableSeatCounts.map((seat_count) => ({ seat_count })),
              error: null,
            }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
}

describe("assessBookingReadiness", () => {
  it("fails when cellar shifts exist but none are active", async () => {
    const supabase = mockReadinessSupabase({
      shifts: [4, 5, 6, 7].map((day) => ({
        day_of_week: day,
        starts_at: "13:00:00",
        ends_at: "16:00:00",
        is_active: false,
        max_covers: 32,
      })),
      tableSeatCounts: [4, 4, 4, 4],
    });

    const result = await assessBookingReadiness(supabase);

    expect(result.live).toBe(false);
    expect(result.reason).toContain("Active service shifts");
  });

  it("fails when there is no active table seating", async () => {
    const supabase = mockReadinessSupabase({
      shifts: [4, 5, 6, 7].map((day) => cellarLunchShift(day, 32)),
      tableSeatCounts: [],
    });

    const result = await assessBookingReadiness(supabase);

    expect(result.live).toBe(false);
    expect(result.reason).toContain("No active table seating");
  });

  it("reports live when settings, hours, shifts, and seating are aligned", async () => {
    const supabase = mockReadinessSupabase({
      shifts: [4, 5, 6, 7].map((day) => cellarLunchShift(day, 32)),
      tableSeatCounts: [8, 8, 8, 8],
    });

    const result = await assessBookingReadiness(supabase);

    expect(result).toEqual({ live: true, reason: null });
  });

  it("fails on seating capacity when shifts and tables are otherwise valid", async () => {
    const supabase = mockReadinessSupabase({
      shifts: [4, 5, 6, 7].map((day) => cellarLunchShift(day, 500)),
      tableSeatCounts: [12, 8],
    });

    const result = await assessBookingReadiness(supabase);

    expect(result.live).toBe(false);
    expect(result.reason).toContain("20 seats");
  });
});
