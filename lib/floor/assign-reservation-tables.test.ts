import { describe, expect, it, vi } from "vitest";
import { assignReservationTablesWithAdmin } from "@/lib/floor/assign-reservation-tables";

const VALID_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("assignReservationTablesWithAdmin", () => {
  it("requires at least one table", async () => {
    const admin = { rpc: vi.fn() };
    const result = await assignReservationTablesWithAdmin(admin as never, {
      reservationId: VALID_UUID,
      tableIds: [],
    });
    expect(result).toEqual({ ok: false, message: "Select at least one table." });
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it("rejects duplicate table ids", async () => {
    const admin = { rpc: vi.fn() };
    const result = await assignReservationTablesWithAdmin(admin as never, {
      reservationId: VALID_UUID,
      tableIds: [VALID_UUID, VALID_UUID],
    });
    expect(result).toEqual({ ok: false, message: "Duplicate tables in assignment." });
  });

  it("maps capacity errors from the RPC", async () => {
    const admin = {
      rpc: vi.fn().mockResolvedValue({
        error: { message: "tables do not cover the party" },
      }),
    };
    const result = await assignReservationTablesWithAdmin(admin as never, {
      reservationId: VALID_UUID,
      tableIds: [VALID_UUID],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/enough seats/i);
    }
  });

  it("returns ok when RPC succeeds", async () => {
    const admin = { rpc: vi.fn().mockResolvedValue({ error: null }) };
    const result = await assignReservationTablesWithAdmin(admin as never, {
      reservationId: VALID_UUID,
      tableIds: [VALID_UUID],
    });
    expect(result).toEqual({ ok: true });
  });
});
