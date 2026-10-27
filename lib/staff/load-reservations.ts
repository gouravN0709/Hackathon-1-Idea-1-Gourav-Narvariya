import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import { reservationMatchesReference } from "@/lib/staff/reference-match";
import type { ReservationStatus, StaffReservationRow } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

type ReservationQueryRow = {
  id: string;
  service_date: string;
  arrival_time: string;
  adult_count: number;
  child_count: number;
  party_size: number;
  status: string;
  notes: string | null;
  updated_at: string;
  guests: { display_name: string } | { display_name: string }[] | null;
  service_shifts: { name: string } | { name: string }[] | null;
  table_assignments: Array<{
    released_at: string | null;
    restaurant_tables: { label: string } | { label: string }[] | null;
  }> | null;
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

function mapRow(row: ReservationQueryRow): StaffReservationRow | null {
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

  return {
    id: row.id,
    reference: formatReservationReference(row.id),
    guestDisplayName: guest?.display_name ?? "Guest",
    serviceDate: row.service_date,
    arrivalTime: row.arrival_time,
    adultCount: row.adult_count,
    childCount: row.child_count,
    partySize: row.party_size,
    status: row.status,
    tableLabels,
    notes: row.notes,
    shiftName: shift?.name ?? null,
    updatedAt: row.updated_at,
  };
}

export type LoadStaffReservationsOptions = {
  serviceDate?: string;
  status?: ReservationStatus | "all";
  referenceQuery?: string;
};

export async function loadStaffReservations(
  supabase: SupabaseClient,
  options: LoadStaffReservationsOptions = {},
): Promise<{ rows: StaffReservationRow[]; error: string | null }> {
  let query = supabase
    .from("reservations")
    .select(
      `
      id,
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
    .order("service_date", { ascending: true })
    .order("arrival_time", { ascending: true });

  if (options.serviceDate) {
    query = query.eq("service_date", options.serviceDate);
  }

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: "Could not load reservations." };
  }

  const rows = ((data ?? []) as ReservationQueryRow[])
    .map(mapRow)
    .filter((row): row is StaffReservationRow => row != null);

  const referenceQuery = options.referenceQuery?.trim();
  if (!referenceQuery) {
    return { rows, error: null };
  }

  return {
    rows: rows.filter((row) => reservationMatchesReference(row.id, referenceQuery)),
    error: null,
  };
}
