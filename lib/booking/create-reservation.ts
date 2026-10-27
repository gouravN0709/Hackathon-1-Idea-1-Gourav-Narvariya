import type { SupabaseClient } from "@supabase/supabase-js";
import { arrivalTimeToDb } from "@/lib/booking/iso-day";
import { mapSupabaseError, bookingError, type BookingError } from "@/lib/booking/map-db-error";
import { formatReservationReference } from "@/lib/booking/reference";
import { assessBookingReadiness } from "@/lib/booking/readiness";
import { resolveShiftIdForBooking } from "@/lib/booking/resolve-shift";
import { selectTablesForParty } from "@/lib/booking/select-tables";
import {
  checkBookingClosedForShift,
  CLOSURE_BOOKING_MESSAGE,
} from "@/lib/booking/special-closure";
import type { ValidatedBookingRequest } from "@/lib/booking/validate-request";

export type CreateReservationResult =
  | { ok: true; reference: string; reservationId: string }
  | { ok: false; error: BookingError };

async function loadAvailableTables(
  supabase: SupabaseClient,
  serviceDate: string,
  shiftId: string,
): Promise<{ id: string; seat_count: number }[]> {
  const { data: tables, error: tablesError } = await supabase
    .from("restaurant_tables")
    .select("id, seat_count")
    .eq("is_active", true)
    .order("seat_count", { ascending: true });

  if (tablesError || !tables?.length) {
    return [];
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("table_assignments")
    .select("table_id")
    .eq("service_date", serviceDate)
    .eq("shift_id", shiftId)
    .is("released_at", null);

  if (assignmentsError) {
    return [];
  }

  const busy = new Set((assignments ?? []).map((row) => row.table_id as string));
  return tables.filter((table) => !busy.has(table.id as string)).map((table) => ({
    id: table.id as string,
    seat_count: table.seat_count as number,
  }));
}

export async function createReservation(
  supabase: SupabaseClient,
  request: ValidatedBookingRequest,
): Promise<CreateReservationResult> {
  const readiness = await assessBookingReadiness(supabase);
  if (!readiness.live) {
    return {
      ok: false,
      error: bookingError("configuration", readiness.reason ?? undefined),
    };
  }

  const shiftId = await resolveShiftIdForBooking(
    supabase,
    request.date,
    request.arrival,
  );
  if (!shiftId) {
    return { ok: false, error: bookingError("unavailable") };
  }

  const closure = await checkBookingClosedForShift(supabase, request.date, shiftId);
  if (closure === "closed") {
    return {
      ok: false,
      error: bookingError("unavailable", CLOSURE_BOOKING_MESSAGE),
    };
  }

  const availableTables = await loadAvailableTables(supabase, request.date, shiftId);
  const tableIds = selectTablesForParty(availableTables, request.partySize);
  if (!tableIds) {
    return { ok: false, error: bookingError("tables") };
  }

  const { data: reservationId, error } = await supabase.rpc("create_reservation", {
    p_service_date: request.date,
    p_shift_id: shiftId,
    p_arrival_time: arrivalTimeToDb(request.arrival),
    p_adult_count: request.adults,
    p_child_count: request.children,
    p_table_ids: tableIds,
    p_guest_name: request.name,
    p_guest_email: request.email,
    p_guest_phone: request.phone,
    p_notes: request.notes || null,
  });

  if (error) {
    return { ok: false, error: mapSupabaseError(error) };
  }

  if (typeof reservationId !== "string" || !reservationId) {
    return { ok: false, error: bookingError("server") };
  }

  return {
    ok: true,
    reservationId,
    reference: formatReservationReference(reservationId),
  };
}
