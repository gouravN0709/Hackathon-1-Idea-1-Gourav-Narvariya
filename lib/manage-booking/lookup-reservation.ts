import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import { guestContactMatches } from "@/lib/manage-booking/guest-contact-match";
import {
  guestCancelBlockedReason,
  guestCanCancelStatus,
} from "@/lib/manage-booking/guest-cancel-eligibility";
import { referenceToUuidIlikePrefix } from "@/lib/manage-booking/reference-prefix";
import type { GuestReservationSummary } from "@/lib/manage-booking/types";
import type { GuestLookupInput } from "@/lib/manage-booking/validate-lookup";
import { formatArrivalTime, formatServiceDateLabel } from "@/lib/staff/format";
import { reservationMatchesReference } from "@/lib/staff/reference-match";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

type ReservationRow = {
  id: string;
  service_date: string;
  arrival_time: string;
  adult_count: number;
  child_count: number;
  party_size: number;
  status: string;
  notes: string | null;
  updated_at: string;
  guest_id: string;
  guests: { display_name: string } | { display_name: string }[] | null;
  service_shifts: { name: string } | { name: string }[] | null;
  table_assignments: Array<{
    released_at: string | null;
    restaurant_tables: { label: string } | { label: string }[] | null;
  }> | null;
};

type GuestContactRow = {
  email: string;
  phone: string;
};

function singleRelation<T>(value: T | T[] | null): T | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

function mapSummary(row: ReservationRow): GuestReservationSummary | null {
  if (!isReservationStatus(row.status)) {
    return null;
  }

  const guest = singleRelation(row.guests);
  const shift = singleRelation(row.service_shifts);
  const tableLabels =
    row.table_assignments
      ?.filter((assignment) => assignment.released_at == null)
      .map((assignment) => singleRelation(assignment.restaurant_tables)?.label)
      .filter((label): label is string => Boolean(label)) ?? [];

  const canCancel = guestCanCancelStatus(row.status);

  return {
    reference: formatReservationReference(row.id),
    guestDisplayName: guest?.display_name ?? "Guest",
    serviceDate: row.service_date,
    serviceDateLabel: formatServiceDateLabel(row.service_date),
    arrivalTime: formatArrivalTime(row.arrival_time),
    adultCount: row.adult_count,
    childCount: row.child_count,
    partySize: row.party_size,
    status: row.status,
    shiftName: shift?.name ?? null,
    tableLabels,
    canCancel,
    cancelBlockedReason: canCancel ? null : guestCancelBlockedReason(row.status),
    updatedAt: row.updated_at,
  };
}

export type VerifiedGuestReservation = {
  summary: GuestReservationSummary;
  reservationId: string;
  notes: string | null;
};

export async function lookupGuestReservation(
  supabase: SupabaseClient,
  input: GuestLookupInput,
): Promise<VerifiedGuestReservation | null> {
  const idPrefix = referenceToUuidIlikePrefix(input.reference);
  if (!idPrefix) {
    return null;
  }

  const { data, error } = await supabase
    .from("reservations")
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
      notes,
      updated_at,
      guests ( display_name ),
      service_shifts ( name ),
      table_assignments (
        released_at,
        restaurant_tables ( label )
      )
    `,
    )
    .ilike("id", `${idPrefix}%`);

  if (error || !data?.length) {
    return null;
  }

  const candidates = (data as ReservationRow[]).filter((row) =>
    reservationMatchesReference(row.id, input.reference),
  );

  if (candidates.length !== 1) {
    return null;
  }

  const reservation = candidates[0]!;

  const { data: contactRow, error: contactError } = await supabase
    .from("guest_contacts")
    .select("email, phone")
    .eq("guest_id", reservation.guest_id)
    .maybeSingle();

  if (contactError || !contactRow) {
    return null;
  }

  const stored = contactRow as GuestContactRow;
  if (!guestContactMatches(input.contact, stored)) {
    return null;
  }

  const summary = mapSummary(reservation);
  if (!summary) {
    return null;
  }

  return {
    summary,
    reservationId: reservation.id,
    notes: reservation.notes,
  };
}
