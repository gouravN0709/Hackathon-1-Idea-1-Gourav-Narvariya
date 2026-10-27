import type { SupabaseClient } from "@supabase/supabase-js";
import { isoDayFromServiceDate } from "@/lib/booking/iso-day";

export async function loadActiveShiftsForServiceDate(
  supabase: SupabaseClient,
  serviceDate: string,
): Promise<
  Array<{
    id: string;
    name: string;
    starts_at: string;
    ends_at: string;
  }>
> {
  const isoDay = isoDayFromServiceDate(serviceDate);
  if (isoDay === null) {
    return [];
  }

  const { data, error } = await supabase
    .from("service_shifts")
    .select("id, name, starts_at, ends_at")
    .eq("day_of_week", isoDay)
    .eq("is_active", true)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Array<{
    id: string;
    name: string;
    starts_at: string;
    ends_at: string;
  }>;
}

export function defaultServiceDateMadrid(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
