import type { SupabaseClient } from "@supabase/supabase-js";
import {
  appendActionNote,
  formatActionNotePrefix,
  isReservationStatus,
  isTransitionAllowed,
  parseReservationId,
  targetStatusForAction,
  validateActionNoteBody,
  validateReplacementNotes,
  type StaffReservationMutationAction,
} from "@/lib/staff/validate-reservation-mutation";
import {
  mapReservationMutationSupabaseError,
  staffMutationError,
  type StaffMutationError,
} from "@/lib/staff/map-reservation-mutation-error";
import type { ReservationStatus } from "@/lib/staff/types";

export type ReservationMutationRow = {
  id: string;
  status: ReservationStatus;
  notes: string | null;
  updated_at: string;
};

export type ApplyReservationMutationInput = {
  reservationId: string;
  expectedUpdatedAt: string;
  action: StaffReservationMutationAction;
  actionNote?: string;
  replacementNotes?: string;
  notePrefixDate: string;
};

export type ApplyReservationMutationResult =
  | { ok: true; idempotent: boolean }
  | { ok: false; error: StaffMutationError };

type ReservationSelectRow = {
  id: string;
  status: string;
  notes: string | null;
  updated_at: string;
};

export async function loadReservationForMutation(
  supabase: SupabaseClient,
  reservationId: string,
): Promise<
  | { ok: true; row: ReservationMutationRow }
  | { ok: false; error: StaffMutationError }
> {
  const { data, error } = await supabase
    .from("reservations")
    .select("id, status, notes, updated_at")
    .eq("id", reservationId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapReservationMutationSupabaseError(error) };
  }

  if (!data) {
    return { ok: false, error: staffMutationError("not_found") };
  }

  const row = data as ReservationSelectRow;
  if (!isReservationStatus(row.status)) {
    return {
      ok: false,
      error: staffMutationError(
        "server",
        "Reservation data is in an unexpected state.",
      ),
    };
  }

  return {
    ok: true,
    row: {
      id: row.id,
      status: row.status,
      notes: row.notes,
      updated_at: row.updated_at,
    },
  };
}

export type BuildReservationMutationPatchResult =
  | { ok: true; idempotent: true }
  | {
      ok: true;
      idempotent: false;
      patch: { status?: ReservationStatus; notes?: string | null };
    }
  | { ok: false; error: StaffMutationError };

export function buildReservationMutationPatch(
  row: ReservationMutationRow,
  input: ApplyReservationMutationInput,
): BuildReservationMutationPatchResult {
  if (row.updated_at !== input.expectedUpdatedAt) {
    return { ok: false, error: staffMutationError("conflict") };
  }

  if (input.action === "edit_notes") {
    const notesValidation = validateReplacementNotes(input.replacementNotes);
    if (!notesValidation.ok) {
      return { ok: false, error: staffMutationError("validation", notesValidation.error) };
    }

    const nextNotes = input.replacementNotes ?? "";
    const normalizedExisting = row.notes ?? "";
    if (nextNotes === normalizedExisting) {
      return { ok: true, idempotent: true };
    }

    return {
      ok: true,
      idempotent: false,
      patch: { notes: nextNotes.length > 0 ? nextNotes : null },
    };
  }

  const targetStatus = targetStatusForAction(input.action);
  if (!targetStatus) {
    return {
      ok: false,
      error: staffMutationError("validation", "Unknown reservation action."),
    };
  }

  if (row.status === targetStatus) {
    return { ok: true, idempotent: true };
  }

  if (!isTransitionAllowed(row.status, input.action)) {
    return {
      ok: false,
      error: staffMutationError(
        "validation",
        "That status change is not allowed for this reservation.",
      ),
    };
  }

  let nextNotes = row.notes;

  if (input.action === "cancel" || input.action === "mark_no_show") {
    const noteValidation = validateActionNoteBody(input.actionNote);
    if (!noteValidation.ok) {
      return { ok: false, error: staffMutationError("validation", noteValidation.error) };
    }

    const prefix = formatActionNotePrefix(
      input.action === "cancel" ? "cancellation" : "no_show",
      input.notePrefixDate,
    );
    const appended = appendActionNote(row.notes, prefix, input.actionNote ?? "");
    if (!appended.ok) {
      return { ok: false, error: staffMutationError("validation", appended.error) };
    }
    nextNotes = appended.notes;
  }

  const patch: { status: ReservationStatus; notes?: string | null } = {
    status: targetStatus,
  };

  if (nextNotes !== row.notes) {
    patch.notes = nextNotes;
  }

  return { ok: true, idempotent: false, patch };
}

export async function applyReservationMutation(
  supabase: SupabaseClient,
  input: ApplyReservationMutationInput,
): Promise<ApplyReservationMutationResult> {
  const reservationId = parseReservationId(input.reservationId);
  if (!reservationId) {
    return {
      ok: false,
      error: staffMutationError("validation", "Invalid reservation identifier."),
    };
  }

  if (
    typeof input.expectedUpdatedAt !== "string" ||
    input.expectedUpdatedAt.trim().length === 0
  ) {
    return {
      ok: false,
      error: staffMutationError("validation", "Missing reservation version."),
    };
  }

  const loaded = await loadReservationForMutation(supabase, reservationId);
  if (!loaded.ok) {
    return loaded;
  }

  const built = buildReservationMutationPatch(loaded.row, {
    ...input,
    reservationId,
  });

  if (!built.ok) {
    return built;
  }

  if (built.idempotent) {
    return { ok: true, idempotent: true };
  }

  if (!built.patch) {
    return { ok: false, error: staffMutationError("server") };
  }

  const { data, error } = await supabase
    .from("reservations")
    .update(built.patch)
    .eq("id", reservationId)
    .eq("updated_at", input.expectedUpdatedAt)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: mapReservationMutationSupabaseError(error) };
  }

  if (!data) {
    return { ok: false, error: staffMutationError("conflict") };
  }

  return { ok: true, idempotent: false };
}
