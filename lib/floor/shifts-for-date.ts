import type { SupabaseClient } from "@supabase/supabase-js";
import { requiredServiceIsoDays } from "@/lib/booking/constants";
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
  return formatServiceDateInMadrid(new Date());
}

function formatServiceDateInMadrid(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Today in Europe/Madrid when it is Thu–Sun service; otherwise the next service day. */
export function defaultBookableServiceDateMadrid(now = new Date()): string {
  const madridToday = formatServiceDateInMadrid(now);
  const todayIso = isoDayFromServiceDate(madridToday);
  if (
    todayIso !== null &&
    (requiredServiceIsoDays as readonly number[]).includes(todayIso)
  ) {
    return madridToday;
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    const serviceDate = formatServiceDateInMadrid(candidate);
    const isoDay = isoDayFromServiceDate(serviceDate);
    if (
      isoDay !== null &&
      (requiredServiceIsoDays as readonly number[]).includes(isoDay)
    ) {
      return serviceDate;
    }
  }

  return madridToday;
}
