import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ValidatedBookingRequest } from "@/lib/booking/validate-request";

vi.mock("@/lib/supabase/admin", () => ({
  hasServiceRoleConfiguration: () => true,
}));

import { createReservation } from "@/lib/booking/create-reservation";

const validRequest: ValidatedBookingRequest = {
  date: "2026-10-29",
  arrival: "13:30",
  adults: 2,
  children: 0,
  name: "Ane Iturrieta",
  email: "guest@example.com",
  phone: "+34 945 445 102",
  notes: "",
  partySize: 2,
};

function liveInventorySupabase(options: {
  readinessShiftsActive?: boolean;
  resolveShifts?: { id: string; starts_at: string; ends_at: string; is_active: boolean }[];
  tables: { id: string; seat_count: number }[];
  busyTableIds?: string[];
  closureRows?: { shift_id: string | null }[];
  rpc?: ReturnType<typeof vi.fn>;
}) {
  const readinessActive = options.readinessShiftsActive ?? true;
  const rpc =
    options.rpc ??
    vi.fn(async () => ({
      data: "00000000-0000-4000-8000-000000000001",
      error: null,
    }));

  const totalSeats = options.tables.reduce((sum, row) => sum + row.seat_count, 0);
  const readinessRows = [4, 5, 6, 7].map((day_of_week) => ({
    day_of_week,
    starts_at: "13:00:00",
    ends_at: "16:00:00",
    is_active: readinessActive,
    max_covers: totalSeats,
  }));

  const resolveRows =
    options.resolveShifts ??
    (readinessActive
      ? [
          {
            id: "shift-thu-lunch",
            starts_at: "13:00:00",
            ends_at: "16:00:00",
            is_active: true,
          },
        ]
      : []);

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
          select: (columns?: string) => {
            if (columns?.includes("day_of_week")) {
              return Promise.resolve({ data: readinessRows, error: null });
            }

            return {
              eq: () => ({
                eq: () => ({
                  order: async () => ({
                    data: resolveRows,
                    error: null,
                  }),
                }),
              }),
            };
          },
        };
      }

      if (table === "restaurant_tables") {
        return {
          select: (columns?: string) => {
            if (columns === "seat_count") {
              return {
                eq: async () => ({
                  data: options.tables.map((row) => ({ seat_count: row.seat_count })),
                  error: null,
                }),
              };
            }

            return {
              eq: () => ({
                order: async () => ({
                  data: options.tables,
                  error: null,
                }),
              }),
            };
          },
        };
      }

      if (table === "table_assignments") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: async () => ({
                  data: (options.busyTableIds ?? []).map((table_id) => ({ table_id })),
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      if (table === "special_closures") {
        return {
          select: () => ({
            lte: () => ({
              gte: async () => ({
                data: options.closureRows ?? [],
                error: null,
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
    rpc,
  } as unknown as SupabaseClient & { rpc: ReturnType<typeof vi.fn> };
}

describe("createReservation", () => {
  it("does not call the database RPC when readiness is not live", async () => {
    const rpc = vi.fn();
    const supabase = liveInventorySupabase({
      readinessShiftsActive: false,
      tables: [{ id: "t1", seat_count: 4 }],
      rpc,
    });

    const result = await createReservation(supabase, validRequest);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("configuration");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns unavailable when a special closure blocks the shift", async () => {
    const rpc = vi.fn();
    const tables = Array.from({ length: 8 }, (_, index) => ({
      id: `t${index + 1}`,
      seat_count: 4,
    }));
    const supabase = liveInventorySupabase({
      tables,
      closureRows: [{ shift_id: null }],
      rpc,
    });

    const result = await createReservation(supabase, validRequest);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unavailable");
      expect(result.error.message).toContain("not open for online booking");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns unavailable when no active shift matches the arrival", async () => {
    const rpc = vi.fn();
    const tables = Array.from({ length: 8 }, (_, index) => ({
      id: `t${index + 1}`,
      seat_count: 4,
    }));
    const supabase = liveInventorySupabase({
      resolveShifts: [],
      tables,
      rpc,
    });

    const result = await createReservation(supabase, validRequest);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unavailable");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns tables when seating cannot fit the party", async () => {
    const rpc = vi.fn();
    const tables = Array.from({ length: 8 }, (_, index) => ({
      id: `t${index + 1}`,
      seat_count: 4,
    }));
    const supabase = liveInventorySupabase({
      tables,
      busyTableIds: tables.slice(1).map((table) => table.id),
      rpc,
    });

    const result = await createReservation(supabase, {
      ...validRequest,
      adults: 10,
      partySize: 10,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("tables");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("maps RPC capacity conflicts to a full booking error", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "service is full for this shift" },
    }));
    const tables = Array.from({ length: 8 }, (_, index) => ({
      id: `t${index + 1}`,
      seat_count: 4,
    }));
    const supabase = liveInventorySupabase({
      tables,
      rpc,
    });

    const result = await createReservation(supabase, validRequest);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("full");
    }
    expect(rpc).toHaveBeenCalledOnce();
  });

  it("returns a reference when readiness, shift, tables, and RPC succeed", async () => {
    const rpc = vi.fn(async () => ({
      data: "00000000-0000-4000-8000-000000000099",
      error: null,
    }));
    const tables = Array.from({ length: 8 }, (_, index) => ({
      id: `t${index + 1}`,
      seat_count: 4,
    }));
    const supabase = liveInventorySupabase({
      tables,
      rpc,
    });

    const result = await createReservation(supabase, validRequest);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reference).toMatch(/^ITU-/);
      expect(rpc).toHaveBeenCalledOnce();
    }
  });
});
