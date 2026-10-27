"use server";

import { revalidatePath } from "next/cache";
import { revalidateAdminPanelPaths, ADMIN_FLOOR_PLAN_PATH } from "@/lib/admin/admin-routes";
import { assignReservationTablesWithAdmin } from "@/lib/floor/assign-reservation-tables";
import { upsertTableServiceState } from "@/lib/floor/upsert-table-service-state";
import { isTableOperationalStatus } from "@/lib/floor/table-status";
import { parseFloorUuid } from "@/lib/floor/validate-floor-layout";
import { applyReservationMutation } from "@/lib/staff/apply-reservation-mutation";
import { requireStaffMutationAccess } from "@/lib/staff/staff-mutation-access";
import { STAFF_FLOOR_PATH, STAFF_RESERVATIONS_PATH } from "@/lib/staff/staff-routes";
import {
  businessDateInMadrid,
  parseMutationAction,
  parseReservationId,
} from "@/lib/staff/validate-reservation-mutation";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type StaffFloorMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialStaffFloorMutationState: StaffFloorMutationState = {
  success: false,
  error: null,
  message: null,
};

function revalidateFloorViews() {
  revalidatePath(STAFF_FLOOR_PATH);
  revalidatePath(STAFF_RESERVATIONS_PATH);
  revalidatePath(ADMIN_FLOOR_PLAN_PATH);
  for (const path of revalidateAdminPanelPaths()) {
    revalidatePath(path);
  }
}

function parseTableIds(formData: FormData): string[] {
  const raw = String(formData.get("tableIds") ?? "");
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => parseFloorUuid(part));
}

export async function assignReservationToTables(
  _prev: StaffFloorMutationState,
  formData: FormData,
): Promise<StaffFloorMutationState> {
  const access = await requireStaffMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  if (!hasServiceRoleConfiguration()) {
    return {
      success: false,
      error: "Table assignment requires server database credentials.",
      message: null,
    };
  }

  const reservationId = parseReservationId(formData.get("reservationId"));
  const tableIds = parseTableIds(formData);

  if (!reservationId) {
    return { success: false, error: "Invalid reservation.", message: null };
  }

  const admin = createAdminClient();
  const result = await assignReservationTablesWithAdmin(admin, {
    reservationId,
    tableIds,
  });

  if (!result.ok) {
    return { success: false, error: result.message, message: null };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Tables assigned." };
}

export async function updateTableOperationalStatus(
  _prev: StaffFloorMutationState,
  formData: FormData,
): Promise<StaffFloorMutationState> {
  const access = await requireStaffMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const tableId = parseFloorUuid(formData.get("tableId"));
  const serviceDate = String(formData.get("serviceDate") ?? "").trim();
  const shiftId = parseFloorUuid(formData.get("shiftId"));
  const nextStatusRaw = String(formData.get("operationalStatus") ?? "").trim();
  const expectedUpdatedAt = String(formData.get("stateUpdatedAt") ?? "").trim() || null;

  if (!tableId || !shiftId || !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
    return { success: false, error: "Invalid table or service selection.", message: null };
  }

  if (!isTableOperationalStatus(nextStatusRaw)) {
    return { success: false, error: "Invalid table status.", message: null };
  }

  const supabase = await createClient();
  const result = await upsertTableServiceState(supabase, {
    tableId,
    serviceDate,
    shiftId,
    nextStatus: nextStatusRaw,
    expectedUpdatedAt,
  });

  if (!result.ok) {
    return { success: false, error: result.message, message: null };
  }

  revalidateFloorViews();
  return {
    success: true,
    error: null,
    message: result.idempotent ? "Table was already in that status." : "Table status updated.",
  };
}

export async function runFloorReservationAndTableAction(
  _prev: StaffFloorMutationState,
  formData: FormData,
): Promise<StaffFloorMutationState> {
  const access = await requireStaffMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const reservationId = parseReservationId(formData.get("reservationId"));
  const action = parseMutationAction(formData.get("reservationAction"));
  const expectedUpdatedAt = String(formData.get("updatedAt") ?? "").trim();
  const serviceDate = String(formData.get("serviceDate") ?? "").trim();
  const shiftId = parseFloorUuid(formData.get("shiftId"));
  const tableIds = parseTableIds(formData);

  if (!reservationId || !action) {
    return { success: false, error: "Invalid reservation action.", message: null };
  }

  const supabase = await createClient();
  const mutation = await applyReservationMutation(supabase, {
    reservationId,
    expectedUpdatedAt,
    action,
    notePrefixDate: businessDateInMadrid(),
  });

  if (!mutation.ok) {
    return { success: false, error: mutation.error.message, message: null };
  }

  if (shiftId && /^\d{4}-\d{2}-\d{2}$/.test(serviceDate) && tableIds.length > 0) {
    if (action === "mark_seated") {
      for (const tableId of tableIds) {
        const tableState = await upsertTableServiceState(supabase, {
          tableId,
          serviceDate,
          shiftId,
          nextStatus: "occupied",
        });
        if (!tableState.ok) {
          return { success: false, error: tableState.message, message: null };
        }
      }
    }

    if (action === "mark_completed") {
      for (const tableId of tableIds) {
        const tableState = await upsertTableServiceState(supabase, {
          tableId,
          serviceDate,
          shiftId,
          nextStatus: "cleaning",
        });
        if (!tableState.ok) {
          return { success: false, error: tableState.message, message: null };
        }
      }
    }
  }

  revalidateFloorViews();
  return {
    success: true,
    error: null,
    message: mutation.idempotent ? "Already up to date." : "Reservation updated.",
  };
}

export async function markGuestArrivedAtTables(
  _prev: StaffFloorMutationState,
  formData: FormData,
): Promise<StaffFloorMutationState> {
  const access = await requireStaffMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const serviceDate = String(formData.get("serviceDate") ?? "").trim();
  const shiftId = parseFloorUuid(formData.get("shiftId"));
  const tableIds = parseTableIds(formData);

  if (!shiftId || !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || tableIds.length < 1) {
    return { success: false, error: "Select tables for this arrival.", message: null };
  }

  const supabase = await createClient();
  for (const tableId of tableIds) {
    const result = await upsertTableServiceState(supabase, {
      tableId,
      serviceDate,
      shiftId,
      nextStatus: "arrived",
    });
    if (!result.ok) {
      return { success: false, error: result.message, message: null };
    }
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Guest marked as arrived." };
}
