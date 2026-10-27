"use server";

import { revalidatePath } from "next/cache";
import { applyReservationMutation } from "@/lib/staff/apply-reservation-mutation";
import { requireStaffMutationAccess } from "@/lib/staff/staff-mutation-access";
import { revalidateAdminPanelPaths } from "@/lib/admin/admin-routes";
import { STAFF_RESERVATIONS_PATH } from "@/lib/staff/staff-routes";
import {
  businessDateInMadrid,
  parseMutationAction,
  parseReservationId,
} from "@/lib/staff/validate-reservation-mutation";
import { createClient } from "@/lib/supabase/server";

export type StaffReservationMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialStaffReservationMutationState: StaffReservationMutationState =
  {
    success: false,
    error: null,
    message: null,
  };

export async function runStaffReservationMutation(
  _prevState: StaffReservationMutationState,
  formData: FormData,
): Promise<StaffReservationMutationState> {
  const access = await requireStaffMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const reservationId = parseReservationId(formData.get("reservationId"));
  const action = parseMutationAction(formData.get("action"));
  const expectedUpdatedAt = String(formData.get("updatedAt") ?? "").trim();

  if (!reservationId) {
    return {
      success: false,
      error: "Invalid reservation identifier.",
      message: null,
    };
  }

  if (!action) {
    return {
      success: false,
      error: "Unknown reservation action.",
      message: null,
    };
  }

  const actionNoteRaw = formData.get("actionNote");
  const actionNote =
    actionNoteRaw == null ? undefined : String(actionNoteRaw);
  const replacementNotesRaw = formData.get("notes");
  const replacementNotes =
    replacementNotesRaw == null ? undefined : String(replacementNotesRaw);

  const supabase = await createClient();
  const result = await applyReservationMutation(supabase, {
    reservationId,
    expectedUpdatedAt,
    action,
    actionNote,
    replacementNotes,
    notePrefixDate: businessDateInMadrid(),
  });

  if (!result.ok) {
    return {
      success: false,
      error: result.error.message,
      message: null,
    };
  }

  revalidatePath(STAFF_RESERVATIONS_PATH);
  for (const path of revalidateAdminPanelPaths()) {
    revalidatePath(path);
  }

  return {
    success: true,
    error: null,
    message: result.idempotent
      ? "Reservation was already up to date."
      : "Reservation updated.",
  };
}
