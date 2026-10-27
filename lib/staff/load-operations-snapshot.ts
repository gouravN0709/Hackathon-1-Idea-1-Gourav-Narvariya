import type { SupabaseClient } from "@supabase/supabase-js";

export type WeeklyHoursRow = {
  id: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
};

export type ServiceShiftRow = {
  id: string;
  name: string;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  max_covers: number;
  is_active: boolean;
};

export type SpecialClosureRow = {
  id: string;
  starts_on: string;
  ends_on: string;
  shift_id: string | null;
  reason: string;
};

export type RestaurantTableRow = {
  id: string;
  label: string;
  seat_count: number;
  is_active: boolean;
  sort_order: number;
};

export type BusinessSettingsRow = {
  id: string;
  timezone: string;
};

export type OperationsSnapshot = {
  weeklyHours: WeeklyHoursRow[];
  shifts: ServiceShiftRow[];
  closures: SpecialClosureRow[];
  tables: RestaurantTableRow[];
  businessSettings: BusinessSettingsRow | null;
  error: string | null;
};

export async function loadOperationsSnapshot(
  supabase: SupabaseClient,
): Promise<OperationsSnapshot> {
  const [hoursResult, shiftsResult, closuresResult, tablesResult, settingsResult] =
    await Promise.all([
    supabase
      .from("weekly_hours")
      .select("id, day_of_week, opens_at, closes_at")
      .order("day_of_week", { ascending: true })
      .order("opens_at", { ascending: true }),
    supabase
      .from("service_shifts")
      .select("id, name, day_of_week, starts_at, ends_at, max_covers, is_active")
      .order("day_of_week", { ascending: true })
      .order("starts_at", { ascending: true }),
    supabase
      .from("special_closures")
      .select("id, starts_on, ends_on, shift_id, reason")
      .order("starts_on", { ascending: true }),
    supabase
      .from("restaurant_tables")
      .select("id, label, seat_count, is_active, sort_order")
      .order("sort_order", { ascending: true }),
    supabase.from("business_settings").select("id, timezone").maybeSingle(),
  ]);

  const firstError =
    hoursResult.error?.message ??
    shiftsResult.error?.message ??
    closuresResult.error?.message ??
    tablesResult.error?.message ??
    settingsResult.error?.message ??
    null;

  return {
    weeklyHours: (hoursResult.data ?? []) as WeeklyHoursRow[],
    shifts: (shiftsResult.data ?? []) as ServiceShiftRow[],
    closures: (closuresResult.data ?? []) as SpecialClosureRow[],
    tables: (tablesResult.data ?? []) as RestaurantTableRow[],
    businessSettings: (settingsResult.data as BusinessSettingsRow | null) ?? null,
    error: firstError,
  };
}
