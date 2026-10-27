import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import { reservationMatchesReference } from "@/lib/staff/reference-match";
import { parseReservationId } from "@/lib/staff/validate-reservation-mutation";
import type { ReservationStatus, StaffReservationRow } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

export type AdminReservationRow = StaffReservationRow & {
  guestEmail: string | null;
  guestPhone: string | null;
};

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
  guests:
    | {
        display_name: string;
        guest_contacts:
          | { email: string; phone: string }
          | { email: string; phone: string }[]
          | null;
      }
    | Array<{
        display_name: string;
        guest_contacts:
          | { email: string; phone: string }
          | { email: string; phone: string }[]
          | null;
      }>
    | null;
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

function mapRow(row: ReservationQueryRow): AdminReservationRow | null {
  if (!isReservationStatus(row.status)) {
    return null;
  }

  const guest = singleRelation(row.guests);
  const shift = singleRelation(row.service_shifts);
  const contactsRaw = guest?.guest_contacts ?? null;
  const contact = Array.isArray(contactsRaw) ? (contactsRaw[0] ?? null) : contactsRaw;
  const tableLabels =
    row.table_assignments
      ?.filter((assignment) => assignment.released_at == null)
      .map((assignment) => singleRelation(assignment.restaurant_tables)?.label)
      .filter((label): label is string => Boolean(label)) ?? [];

  return {
    id: row.id,
    reference: formatReservationReference(row.id),
    guestDisplayName: guest?.display_name ?? "Guest",
    guestEmail: contact?.email ?? null,
    guestPhone: contact?.phone ?? null,
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

export type LoadAdminReservationsOptions = {
  serviceDate?: string;
  status?: ReservationStatus | "all";
  searchQuery?: string;
  page?: number;
  pageSize?: number;
};

export type LoadAdminReservationsResult = {
  rows: AdminReservationRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
};

const DEFAULT_PAGE_SIZE = 25;

export async function loadAdminReservations(
  supabase: SupabaseClient,
  options: LoadAdminReservationsOptions = {},
): Promise<LoadAdminReservationsResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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
      guests (
        display_name,
        guest_contacts ( email, phone )
      ),
      service_shifts ( name ),
      table_assignments (
        released_at,
        restaurant_tables ( label )
      )
    `,
      { count: "exact" },
    )
    .order("service_date", { ascending: false })
    .order("arrival_time", { ascending: true });

  if (options.serviceDate) {
    query = query.eq("service_date", options.serviceDate);
  }

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  const search = options.searchQuery?.trim() ?? "";
  const parsedId = parseReservationId(search.replace(/^#?ref[- ]?/i, "").trim());
  if (parsedId) {
    query = query.eq("id", parsedId);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return {
      rows: [],
      totalCount: 0,
      page,
      pageSize,
      error: "Could not load reservations.",
    };
  }

  let rows = ((data ?? []) as unknown as ReservationQueryRow[])
    .map(mapRow)
    .filter((row): row is AdminReservationRow => row != null);

  if (search) {
    const needle = search.toLowerCase();
    rows = rows.filter((row) => {
      if (reservationMatchesReference(row.id, search)) {
        return true;
      }
      return (
        row.guestDisplayName.toLowerCase().includes(needle) ||
        row.reference.toLowerCase().includes(needle) ||
        (row.guestEmail?.toLowerCase().includes(needle) ?? false) ||
        (row.guestPhone?.toLowerCase().includes(needle) ?? false)
      );
    });
  }

  return {
    rows,
    totalCount: count ?? rows.length,
    page,
    pageSize,
    error: null,
  };
}
