import type { SupabaseClient } from "@supabase/supabase-js";
import { mapReservationMutationSupabaseError } from "@/lib/staff/map-reservation-mutation-error";

export type AssignReservationTablesResult =
  | { ok: true }
  | { ok: false; message: string };

export async function assignReservationTablesWithAdmin(
  admin: SupabaseClient,
  input: { reservationId: string; tableIds: string[] },
): Promise<AssignReservationTablesResult> {
  if (input.tableIds.length < 1) {
    return { ok: false, message: "Select at least one table." };
  }

  const unique = [...new Set(input.tableIds)];
  if (unique.length !== input.tableIds.length) {
    return { ok: false, message: "Duplicate tables in assignment." };
  }

  const { error } = await admin.rpc("assign_reservation_tables", {
    p_reservation_id: input.reservationId,
    p_table_ids: unique,
  });

  if (error) {
    const mapped = mapReservationMutationSupabaseError(error);
    return { ok: false, message: mapped.message };
  }

  return { ok: true };
}
