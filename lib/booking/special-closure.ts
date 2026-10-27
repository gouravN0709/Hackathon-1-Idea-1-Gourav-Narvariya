import type { SupabaseClient } from "@supabase/supabase-js";

/** Safe guest-facing copy — never includes closure.reason from the database. */
export const CLOSURE_BOOKING_MESSAGE =
  "That date is not open for online booking. Choose another service day or call the farm.";

export type SpecialClosureRow = {
  shift_id: string | null;
};

/**
 * Matches `private.assert_service_bookable` in migration
 * `20261026184605_restaurant_operations.sql` (date in range and shift scope).
 */
export function closureBlocksBooking(
  closures: SpecialClosureRow[],
  shiftId: string,
): boolean {
  return closures.some(
    (row) => row.shift_id === null || row.shift_id === shiftId,
  );
}

export async function loadSpecialClosuresForDate(
  supabase: SupabaseClient,
  serviceDate: string,
): Promise<{ closures: SpecialClosureRow[]; readFailed: boolean }> {
  const { data, error } = await supabase
    .from("special_closures")
    .select("shift_id")
    .lte("starts_on", serviceDate)
    .gte("ends_on", serviceDate);

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return { closures: [], readFailed: false };
    }
    return { closures: [], readFailed: true };
  }

  return { closures: (data ?? []) as SpecialClosureRow[], readFailed: false };
}

export type ClosureBookingCheck = "open" | "closed" | "unknown";

export async function checkBookingClosedForShift(
  supabase: SupabaseClient,
  serviceDate: string,
  shiftId: string,
): Promise<ClosureBookingCheck> {
  const { closures, readFailed } = await loadSpecialClosuresForDate(
    supabase,
    serviceDate,
  );
  if (readFailed) {
    return "unknown";
  }
  return closureBlocksBooking(closures, shiftId) ? "closed" : "open";
}
