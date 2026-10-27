import type { StaffAccess, StaffReservationRow } from "@/lib/staff/types";
import type { StaffSession } from "@/lib/staff/require-staff-access";

export type StaffReservationLoadResult = {
  rows: StaffReservationRow[];
  error: string | null;
};

/**
 * Maps staff access and a database load into UI state. Never substitutes sample data.
 */
export function resolveStaffReservationViewState(
  access: StaffAccess | StaffSession,
  loaded: StaffReservationLoadResult,
): StaffReservationLoadResult {
  if (access.kind !== "staff") {
    return { rows: [], error: null };
  }

  if (loaded.error) {
    return { rows: [], error: loaded.error };
  }

  return { rows: loaded.rows, error: null };
}
