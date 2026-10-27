"use server";

import { revalidatePath } from "next/cache";
import { revalidateAdminPanelPaths } from "@/lib/admin/admin-routes";
import { requireAdminMutationAccess } from "@/lib/admin/require-admin-access";
import { applyReservationMutation } from "@/lib/staff/apply-reservation-mutation";
import { STAFF_RESERVATIONS_PATH } from "@/lib/staff/staff-routes";
import {
  businessDateInMadrid,
  parseMutationAction,
  parseReservationId,
} from "@/lib/staff/validate-reservation-mutation";
import { createReservation } from "@/lib/booking/create-reservation";
import { validateBookingRequest } from "@/lib/booking/validate-request";
import {
  createAdminClient,
  hasServiceRoleConfiguration,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminCreateReservationState,
  AdminReservationMutationState,
} from "@/app/admin/(panel)/reservations/mutation-state";

function revalidateReservationViews() {
  revalidatePath(STAFF_RESERVATIONS_PATH);
  for (const path of revalidateAdminPanelPaths()) {
    revalidatePath(path);
  }
}

export async function runAdminReservationMutation(
  _prevState: AdminReservationMutationState,
  formData: FormData,
): Promise<AdminReservationMutationState> {
  const access = await requireAdminMutationAccess();
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

  revalidateReservationViews();

  return {
    success: true,
    error: null,
    message: result.idempotent
      ? "Reservation was already up to date."
      : "Reservation updated.",
  };
}

function fieldsFromCreateForm(formData: FormData): Record<string, string> {
  return {
    date: String(formData.get("date") ?? ""),
    arrival: String(formData.get("arrival") ?? ""),
    adults: String(formData.get("adults") ?? ""),
    children: String(formData.get("children") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createAdminReservation(
  _prev: AdminCreateReservationState,
  formData: FormData,
): Promise<AdminCreateReservationState> {
  const fields = fieldsFromCreateForm(formData);
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null, reference: null, fields };
  }

  if (!hasServiceRoleConfiguration()) {
    return {
      success: false,
      error:
        "Manual booking requires SUPABASE_SECRET_KEY on the server. It is not configured.",
      message: null,
      reference: null,
      fields,
    };
  }

  const parsed = validateBookingRequest({
    date: fields.date,
    arrival: fields.arrival,
    adults: Number(fields.adults),
    children: Number(fields.children),
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    notes: fields.notes,
  });

  if (!parsed.ok) {
    const firstError = Object.values(parsed.errors)[0] ?? "Invalid booking details.";
    return {
      success: false,
      error: firstError,
      message: null,
      reference: null,
      fields,
    };
  }

  const admin = createAdminClient();
  const result = await createReservation(admin, parsed.value);

  if (!result.ok) {
    return {
      success: false,
      error: result.error.message,
      message: null,
      reference: null,
      fields,
    };
  }

  revalidateReservationViews();

  return {
    success: true,
    error: null,
    message: "Reservation created.",
    reference: result.reference,
    fields: undefined,
  };
}
