import { describe, expect, it, vi } from "vitest";
import {
  applyReservationMutation,
  buildReservationMutationPatch,
  type ReservationMutationRow,
} from "@/lib/staff/apply-reservation-mutation";
import type { SupabaseClient } from "@supabase/supabase-js";

const VALID_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
const UPDATED_AT = "2026-10-27T10:00:00.000Z";

function baseRow(overrides: Partial<ReservationMutationRow> = {}): ReservationMutationRow {
  return {
    id: VALID_UUID,
    status: "pending",
    notes: null,
    updated_at: UPDATED_AT,
    ...overrides,
  };
}

describe("buildReservationMutationPatch", () => {
  it("returns idempotent success when status already matches", () => {
    const result = buildReservationMutationPatch(baseRow({ status: "confirmed" }), {
      reservationId: VALID_UUID,
      expectedUpdatedAt: UPDATED_AT,
      action: "confirm",
      notePrefixDate: "2026-10-27",
    });
    expect(result).toEqual({ ok: true, idempotent: true });
  });

  it("returns conflict when updated_at does not match", () => {
    const result = buildReservationMutationPatch(baseRow(), {
      reservationId: VALID_UUID,
      expectedUpdatedAt: "2026-10-27T09:00:00.000Z",
      action: "confirm",
      notePrefixDate: "2026-10-27",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("conflict");
    }
  });

  it("requires cancel notes and appends with prefix", () => {
    const withoutNote = buildReservationMutationPatch(
      baseRow({ status: "confirmed" }),
      {
        reservationId: VALID_UUID,
        expectedUpdatedAt: UPDATED_AT,
        action: "cancel",
        notePrefixDate: "2026-10-27",
      },
    );
    expect(withoutNote.ok).toBe(false);

    const withNote = buildReservationMutationPatch(
      baseRow({ status: "confirmed", notes: "Keep this" }),
      {
        reservationId: VALID_UUID,
        expectedUpdatedAt: UPDATED_AT,
        action: "cancel",
        actionNote: "Guest cancelled by phone",
        notePrefixDate: "2026-10-27",
      },
    );
    expect(withNote.ok).toBe(true);
    if (withNote.ok && !withNote.idempotent) {
      expect(withNote.patch.notes).toContain("Keep this");
      expect(withNote.patch.notes).toContain("[Cancellation note — 2026-10-27]");
      expect(withNote.patch.status).toBe("cancelled");
    }
  });

  it("replaces notes for edit_notes", () => {
    const result = buildReservationMutationPatch(baseRow({ notes: "Old" }), {
      reservationId: VALID_UUID,
      expectedUpdatedAt: UPDATED_AT,
      action: "edit_notes",
      replacementNotes: "New staff note",
      notePrefixDate: "2026-10-27",
    });
    expect(result).toEqual({
      ok: true,
      idempotent: false,
      patch: { notes: "New staff note" },
    });
  });
});

describe("applyReservationMutation", () => {
  it("uses optimistic concurrency on update", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: VALID_UUID }, error: null }),
          }),
        }),
      }),
    });

    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: VALID_UUID,
        status: "pending",
        notes: null,
        updated_at: UPDATED_AT,
      },
      error: null,
    });

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle }),
        }),
        update,
      }),
    } as unknown as SupabaseClient;

    const result = await applyReservationMutation(supabase, {
      reservationId: VALID_UUID,
      expectedUpdatedAt: UPDATED_AT,
      action: "confirm",
      notePrefixDate: "2026-10-27",
    });

    expect(result.ok).toBe(true);
    expect(update).toHaveBeenCalledWith({ status: "confirmed" });
    const eqChain = update.mock.results[0]?.value.eq;
    expect(eqChain).toHaveBeenCalledWith("id", VALID_UUID);
    expect(eqChain.mock.results[0]?.value.eq).toHaveBeenCalledWith(
      "updated_at",
      UPDATED_AT,
    );
  });

  it("returns conflict when update matches zero rows", async () => {
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });

    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: VALID_UUID,
                status: "pending",
                notes: null,
                updated_at: UPDATED_AT,
              },
              error: null,
            }),
          }),
        }),
        update,
      }),
    } as unknown as SupabaseClient;

    const result = await applyReservationMutation(supabase, {
      reservationId: VALID_UUID,
      expectedUpdatedAt: UPDATED_AT,
      action: "confirm",
      notePrefixDate: "2026-10-27",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("conflict");
    }
  });

  it("rejects demo sample ids before querying", async () => {
    const from = vi.fn();
    const supabase = { from } as unknown as SupabaseClient;

    const result = await applyReservationMutation(supabase, {
      reservationId: "sample-2",
      expectedUpdatedAt: UPDATED_AT,
      action: "confirm",
      notePrefixDate: "2026-10-27",
    });

    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });
});
