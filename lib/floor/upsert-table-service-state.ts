import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canTransitionTableStatus,
  isTableOperationalStatus,
} from "@/lib/floor/table-status";
import type { TableOperationalStatus } from "@/lib/floor/types";

export type UpsertTableStateResult =
  | { ok: true; idempotent: boolean }
  | { ok: false; message: string };

export async function upsertTableServiceState(
  supabase: SupabaseClient,
  input: {
    tableId: string;
    serviceDate: string;
    shiftId: string;
    nextStatus: TableOperationalStatus;
    expectedUpdatedAt?: string | null;
    currentStatus?: TableOperationalStatus | null;
  },
): Promise<UpsertTableStateResult> {
  const { data: existing, error: loadError } = await supabase
    .from("table_service_states")
    .select("operational_status, updated_at")
    .eq("table_id", input.tableId)
    .eq("service_date", input.serviceDate)
    .eq("shift_id", input.shiftId)
    .maybeSingle();

  if (loadError) {
    return {
      ok: false,
      message: "Could not load table status. Confirm the floor migration is applied.",
    };
  }

  if (existing && input.expectedUpdatedAt && existing.updated_at !== input.expectedUpdatedAt) {
    return {
      ok: false,
      message: "Table status changed elsewhere. Refresh and try again.",
    };
  }

  const fromStatus = existing
    ? isTableOperationalStatus(existing.operational_status)
      ? existing.operational_status
      : input.currentStatus ?? "available"
    : input.currentStatus ?? "available";

  if (fromStatus === input.nextStatus) {
    return { ok: true, idempotent: true };
  }

  if (!canTransitionTableStatus(fromStatus, input.nextStatus)) {
    return {
      ok: false,
      message: `Cannot change table from ${fromStatus} to ${input.nextStatus}.`,
    };
  }

  if (existing) {
    const { error } = await supabase
      .from("table_service_states")
      .update({
        operational_status: input.nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("table_id", input.tableId)
      .eq("service_date", input.serviceDate)
      .eq("shift_id", input.shiftId)
      .eq("updated_at", existing.updated_at);

    if (error) {
      return { ok: false, message: "Could not update table status." };
    }
    return { ok: true, idempotent: false };
  }

  const { error } = await supabase.from("table_service_states").insert({
    table_id: input.tableId,
    service_date: input.serviceDate,
    shift_id: input.shiftId,
    operational_status: input.nextStatus,
  });

  if (error) {
    return { ok: false, message: "Could not save table status." };
  }

  return { ok: true, idempotent: false };
}
