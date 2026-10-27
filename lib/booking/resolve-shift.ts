import type { SupabaseClient } from "@supabase/supabase-js";
import { arrivalTimeToDb, isoDayFromServiceDate } from "@/lib/booking/iso-day";
import type { ArrivalTime } from "@/lib/booking/constants";

type ServiceShiftRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

function arrivalWithinShift(arrival: string, startsAt: string, endsAt: string): boolean {
  const dbArrival = arrivalTimeToDb(arrival);
  return dbArrival >= startsAt && dbArrival < endsAt;
}

export async function resolveShiftIdForBooking(
  supabase: SupabaseClient,
  serviceDate: string,
  arrival: ArrivalTime | string,
): Promise<string | null> {
  const isoDay = isoDayFromServiceDate(serviceDate);
  if (isoDay === null) {
    return null;
  }

  const { data, error } = await supabase
    .from("service_shifts")
    .select("id, starts_at, ends_at, is_active")
    .eq("day_of_week", isoDay)
    .eq("is_active", true)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return null;
  }

  const matches = (data as ServiceShiftRow[]).filter((shift) =>
    arrivalWithinShift(arrival, shift.starts_at, shift.ends_at),
  );

  return matches[0]?.id ?? null;
}
