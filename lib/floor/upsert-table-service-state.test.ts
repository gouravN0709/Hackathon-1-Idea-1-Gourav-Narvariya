import { describe, expect, it, vi } from "vitest";
import { upsertTableServiceState } from "@/lib/floor/upsert-table-service-state";

const TABLE_ID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const SHIFT_ID = "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e";

function mockSupabase(existing: { operational_status: string; updated_at: string } | null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
  return {
    from: vi.fn(() => chain),
    chain,
  };
}

describe("upsertTableServiceState", () => {
  it("returns idempotent when status unchanged", async () => {
    const { from } = mockSupabase({
      operational_status: "reserved",
      updated_at: "2026-10-27T10:00:00.000Z",
    });
    const result = await upsertTableServiceState({ from } as never, {
      tableId: TABLE_ID,
      serviceDate: "2026-10-27",
      shiftId: SHIFT_ID,
      nextStatus: "reserved",
    });
    expect(result).toEqual({ ok: true, idempotent: true });
  });

  it("rejects invalid transitions", async () => {
    const { from } = mockSupabase({
      operational_status: "occupied",
      updated_at: "2026-10-27T10:00:00.000Z",
    });
    const result = await upsertTableServiceState({ from } as never, {
      tableId: TABLE_ID,
      serviceDate: "2026-10-27",
      shiftId: SHIFT_ID,
      nextStatus: "available",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/cannot change table/i);
    }
  });

  it("detects optimistic concurrency conflicts", async () => {
    const { from } = mockSupabase({
      operational_status: "reserved",
      updated_at: "2026-10-27T10:00:00.000Z",
    });
    const result = await upsertTableServiceState({ from } as never, {
      tableId: TABLE_ID,
      serviceDate: "2026-10-27",
      shiftId: SHIFT_ID,
      nextStatus: "arrived",
      expectedUpdatedAt: "2026-10-27T09:00:00.000Z",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/refresh/i);
    }
  });
});
