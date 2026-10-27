import { describe, expect, it, vi } from "vitest";
import { loadFloorServiceSnapshot } from "@/lib/floor/load-floor-snapshot";

const TABLE_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const SHIFT_ID = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";

describe("loadFloorServiceSnapshot", () => {
  it("falls back when Phase 2 schema columns are missing", async () => {
    const legacyRow = {
      id: TABLE_ID,
      label: "T1",
      seat_count: 4,
      is_active: true,
      sort_order: 0,
    };

    let restaurantTablesCalls = 0;

    const from = vi.fn((table: string) => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn(),
      };

      if (table === "restaurant_areas") {
        chain.order = vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'relation "restaurant_areas" does not exist' },
        });
        return chain;
      }

      if (table === "restaurant_tables") {
        restaurantTablesCalls += 1;
        chain.order = vi.fn().mockResolvedValue(
          restaurantTablesCalls === 1
            ? {
                data: null,
                error: { message: "column area_id does not exist" },
              }
            : { data: [legacyRow], error: null },
        );
        return chain;
      }

      if (table === "service_shifts") {
        chain.order = vi
          .fn()
          .mockReturnValueOnce(chain)
          .mockResolvedValueOnce({ data: [], error: null });
        return chain;
      }

      if (table === "table_service_states") {
        chain.eq = vi.fn().mockReturnThis();
        chain.order = vi.fn().mockResolvedValue({ data: [], error: null });
        return chain;
      }

      if (table === "reservations") {
        chain.order = vi.fn().mockResolvedValue({ data: [], error: null });
        return chain;
      }

      return chain;
    });

    const snapshot = await loadFloorServiceSnapshot({ from } as never, {
      serviceDate: "2026-10-27",
      shiftId: SHIFT_ID,
    });

    expect(snapshot.schemaReady).toBe(false);
    expect(snapshot.tables).toHaveLength(1);
    expect(snapshot.tables[0]?.label).toBe("T1");
    expect(snapshot.tables[0]?.position_x).toBe(0);
  });
});
