import type { SupabaseClient } from "@supabase/supabase-js";
import {
  guestCanCancelStatus,
  guestCancelBlockedReason,
} from "@/lib/manage-booking/guest-cancel-eligibility";
import { lookupGuestReservation } from "@/lib/manage-booking/lookup-reservation";
import type { GuestReservationSummary } from "@/lib/manage-booking/types";
import type { GuestLookupInput } from "@/lib/manage-booking/validate-lookup";
import { mapReservationMutationSupabaseError } from "@/lib/staff/map-reservation-mutation-error";
import {
  appendActionNote,
  businessDateInMadrid,
  RESERVATION_NOTES_MAX_LENGTH,
} from "@/lib/staff/validate-reservation-mutation";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

export const guestCancelReasons = [
  { value: "travel", label: "Changes in itinerary or travel schedule" },
  { value: "illness", label: "Illness or personal emergency" },
  { value: "reschedule", label: "Need a different date" },
  { value: "group", label: "Party size changed" },
  { value: "other", label: "Other reason" },
] as const;

export type GuestCancelReason = (typeof guestCancelReasons)[number]["value"];

export type GuestCancelInput = GuestLookupInput & {
  updatedAt: string;
  reason?: string;
  message?: string;
};

export type GuestCancelErrorCode =
  | "not_found"
  | "validation"
  | "ineligible"
  | "conflict"
  | "server";

export type GuestCancelResult =
  | { ok: true; idempotent: boolean; reservation: GuestReservationSummary }
  | { ok: false; code: GuestCancelErrorCode; message: string };

function isGuestCancelReason(value: string): value is GuestCancelReason {
  return guestCancelReasons.some((entry) => entry.value === value);
}

function guestCancelNotePrefix(businessDate: string): string {
  return `[Guest cancellation — ${businessDate}] `;
}

export function validateGuestCancelInput(
  input: GuestCancelInput,
): { ok: true; value: GuestCancelInput } | { ok: false; message: string } {
  if (typeof input.updatedAt !== "string" || input.updatedAt.trim().length === 0) {
    return { ok: false, message: "Missing reservation version." };
  }

  const message = (input.message ?? "").trim();
  if (message.length > RESERVATION_NOTES_MAX_LENGTH) {
    return { ok: false, message: "Keep the message to 800 characters." };
  }

  const reason = (input.reason ?? "").trim();
  if (reason && !isGuestCancelReason(reason)) {
    return { ok: false, message: "Choose a valid cancellation reason." };
  }

  return {
    ok: true,
    value: {
      ...input,
      updatedAt: input.updatedAt.trim(),
      message,
      reason: reason || undefined,
    },
  };
}

function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

export async function cancelGuestReservation(
  supabase: SupabaseClient,
  input: GuestCancelInput,
): Promise<GuestCancelResult> {
  const validated = validateGuestCancelInput(input);
  if (!validated.ok) {
    return { ok: false, code: "validation", message: validated.message };
  }

  const verified = await lookupGuestReservation(supabase, validated.value);
  if (!verified) {
    return {
      ok: false,
      code: "not_found",
      message: "We could not verify this booking. Check the reference and contact details.",
    };
  }

  if (verified.summary.updatedAt !== validated.value.updatedAt) {
    return {
      ok: false,
      code: "conflict",
      message: "This reservation changed. Look it up again before cancelling.",
    };
  }

  const status = verified.summary.status;
  if (status === "cancelled") {
    return { ok: true, idempotent: true, reservation: verified.summary };
  }

  if (!guestCanCancelStatus(status)) {
    return {
      ok: false,
      code: "ineligible",
      message:
        guestCancelBlockedReason(status) ??
        "This reservation cannot be cancelled online.",
    };
  }

  let nextNotes = verified.notes;
  const reasonLabel = validated.value.reason
    ? guestCancelReasons.find((entry) => entry.value === validated.value.reason)?.label
    : undefined;
  const noteBody = [reasonLabel, validated.value.message].filter(Boolean).join(" — ");

  if (noteBody.length > 0) {
    const appended = appendActionNote(
      verified.notes,
      guestCancelNotePrefix(businessDateInMadrid()),
      noteBody,
    );
    if (!appended.ok) {
      return { ok: false, code: "validation", message: appended.error };
    }
    nextNotes = appended.notes;
  }

  const patch: { status: ReservationStatus; notes?: string | null } = {
    status: "cancelled",
  };
  if (nextNotes !== verified.notes) {
    patch.notes = nextNotes;
  }

  const { data, error } = await supabase
    .from("reservations")
    .update(patch)
    .eq("id", verified.reservationId)
    .eq("updated_at", validated.value.updatedAt)
    .in("status", ["pending", "confirmed"])
    .select(
      `
      id,
      guest_id,
      service_date,
      arrival_time,
      adult_count,
      child_count,
      party_size,
      status,
      updated_at,
      guests ( display_name ),
      service_shifts ( name ),
      table_assignments (
        released_at,
        restaurant_tables ( label )
      )
    `,
    )
    .maybeSingle();

  if (error) {
    const mapped = mapReservationMutationSupabaseError(error);
    if (mapped.code === "conflict") {
      return {
        ok: false,
        code: "conflict",
        message: "This reservation changed. Look it up again before cancelling.",
      };
    }
    return {
      ok: false,
      code: "server",
      message: "We could not cancel this booking. Try again or call the farm.",
    };
  }

  if (!data) {
    const refreshed = await lookupGuestReservation(supabase, validated.value);
    if (refreshed?.summary.status === "cancelled") {
      return { ok: true, idempotent: true, reservation: refreshed.summary };
    }
    return {
      ok: false,
      code: "conflict",
      message: "This reservation changed. Look it up again before cancelling.",
    };
  }

  const row = data as {
    id: string;
    service_date: string;
    arrival_time: string;
    adult_count: number;
    child_count: number;
    party_size: number;
    status: string;
    updated_at: string;
    guests: { display_name: string } | { display_name: string }[] | null;
    service_shifts: { name: string } | { name: string }[] | null;
    table_assignments: Array<{
      released_at: string | null;
      restaurant_tables: { label: string } | { label: string }[] | null;
    }> | null;
  };

  if (!isReservationStatus(row.status)) {
    return {
      ok: false,
      code: "server",
      message: "We could not cancel this booking. Try again or call the farm.",
    };
  }

  const relookup = await lookupGuestReservation(supabase, validated.value);
  if (!relookup) {
    return {
      ok: false,
      code: "server",
      message: "We could not cancel this booking. Try again or call the farm.",
    };
  }

  return { ok: true, idempotent: false, reservation: relookup.summary };
}
