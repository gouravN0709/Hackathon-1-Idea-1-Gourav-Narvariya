import type { SupabaseClient } from "@supabase/supabase-js";
import { requiredServiceIsoDays, serviceWindowCloses, serviceWindowOpens } from "@/lib/booking/constants";
import { hasServiceRoleConfiguration } from "@/lib/supabase/admin";

export type BookingReadiness = {
  live: boolean;
  reason: string | null;
};

type WeeklyHoursRow = {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
};

type ServiceShiftRow = {
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  max_covers: number;
};

type ActiveTableSeatRow = {
  seat_count: number;
};

function isBookableCellarShift(row: ServiceShiftRow): boolean {
  return (
    (requiredServiceIsoDays as readonly number[]).includes(row.day_of_week) &&
    row.is_active &&
    shiftCoversService(row.starts_at, row.ends_at)
  );
}

/**
 * Returns a not-live readiness result when seating capacity cannot honor shift
 * cover limits. Exported for unit tests.
 */
export function evaluateSeatingCapacityReadiness(
  activeShifts: ServiceShiftRow[],
  totalActiveSeats: number,
): BookingReadiness | null {
  if (totalActiveSeats < 1) {
    return {
      live: false,
      reason:
        "No active table seating is configured. Add active dining tables with seat counts before online booking can go live.",
    };
  }

  const overLimit = activeShifts.filter(
    (row) => isBookableCellarShift(row) && row.max_covers > totalActiveSeats,
  );

  if (overLimit.length > 0) {
    return {
      live: false,
      reason: `Active service shifts allow more covers than active table seating (${totalActiveSeats} seats in total). Lower each shift's max_covers or add tables.`,
    };
  }

  return null;
}

function timeCoversService(opensAt: string, closesAt: string): boolean {
  return opensAt <= serviceWindowOpens && closesAt >= serviceWindowCloses;
}

function shiftCoversService(startsAt: string, endsAt: string): boolean {
  return startsAt <= serviceWindowOpens && endsAt >= serviceWindowCloses;
}

export async function assessBookingReadiness(
  supabase: SupabaseClient,
): Promise<BookingReadiness> {
  if (!hasServiceRoleConfiguration()) {
    return {
      live: false,
      reason: "Server booking credentials are not configured.",
    };
  }

  const { data: settings, error: settingsError } = await supabase
    .from("business_settings")
    .select("timezone")
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    if (settingsError.code === "42P01" || settingsError.message.includes("does not exist")) {
      return {
        live: false,
        reason: "The reservation database migration has not been applied.",
      };
    }
    return {
      live: false,
      reason: "Could not verify business settings.",
    };
  }

  if (!settings?.timezone) {
    return {
      live: false,
      reason: "Business settings are missing from the database.",
    };
  }

  const { data: weeklyHours, error: hoursError } = await supabase
    .from("weekly_hours")
    .select("day_of_week, opens_at, closes_at");

  if (hoursError) {
    return { live: false, reason: "Could not read weekly operating hours." };
  }

  const hoursByDay = new Map<number, WeeklyHoursRow[]>();
  for (const row of (weeklyHours ?? []) as WeeklyHoursRow[]) {
    const list = hoursByDay.get(row.day_of_week) ?? [];
    list.push(row);
    hoursByDay.set(row.day_of_week, list);
  }

  for (const isoDay of requiredServiceIsoDays) {
    const dayHours = hoursByDay.get(isoDay) ?? [];
    const covers = dayHours.some((row) => timeCoversService(row.opens_at, row.closes_at));
    if (!covers) {
      return {
        live: false,
        reason: "Weekly hours for cellar service days are not configured in the database.",
      };
    }
  }

  const { data: shifts, error: shiftsError } = await supabase
    .from("service_shifts")
    .select("day_of_week, starts_at, ends_at, is_active, max_covers");

  if (shiftsError) {
    return { live: false, reason: "Could not read service shifts." };
  }

  const activeShifts = ((shifts ?? []) as ServiceShiftRow[]).filter((row) => row.is_active);

  for (const isoDay of requiredServiceIsoDays) {
    const dayShifts = activeShifts.filter((row) => row.day_of_week === isoDay);
    const covers = dayShifts.some((row) => shiftCoversService(row.starts_at, row.ends_at));
    if (!covers) {
      return {
        live: false,
        reason: "Active service shifts for cellar days are not configured in the database.",
      };
    }
  }

  const { data: activeTables, error: tablesError } = await supabase
    .from("restaurant_tables")
    .select("seat_count")
    .eq("is_active", true);

  if (tablesError) {
    return { live: false, reason: "Could not read restaurant tables." };
  }

  const totalActiveSeats = ((activeTables ?? []) as ActiveTableSeatRow[]).reduce(
    (sum, row) => sum + row.seat_count,
    0,
  );

  const capacityReadiness = evaluateSeatingCapacityReadiness(activeShifts, totalActiveSeats);
  if (capacityReadiness) {
    return capacityReadiness;
  }

  return { live: true, reason: null };
}
