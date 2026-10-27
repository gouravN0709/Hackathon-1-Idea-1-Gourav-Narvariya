import {
  requiredServiceIsoDays,
  serviceWindowCloses,
  serviceWindowOpens,
} from "@/lib/booking/constants";
import {
  isLegacyDemoTableLabel,
  isStagingDemoInventory,
} from "@/lib/booking/staging-demo-inventory";
import { evaluateSeatingCapacityReadiness } from "@/lib/booking/readiness";
import type {
  OperationsSnapshot,
  RestaurantTableRow,
  ServiceShiftRow,
  WeeklyHoursRow,
} from "@/lib/staff/load-operations-snapshot";

export type ReadinessCheckStatus = "pass" | "warn" | "fail" | "info";

export type ReadinessCheckItem = {
  id: string;
  label: string;
  status: ReadinessCheckStatus;
  detail: string;
};

const ISO_WEEKDAY_LABEL = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function timeCoversService(opensAt: string, closesAt: string): boolean {
  return opensAt <= serviceWindowOpens && closesAt >= serviceWindowCloses;
}

function shiftCoversService(startsAt: string, endsAt: string): boolean {
  return startsAt <= serviceWindowOpens && endsAt >= serviceWindowCloses;
}

function isBookableCellarShift(row: ServiceShiftRow): boolean {
  return (
    (requiredServiceIsoDays as readonly number[]).includes(row.day_of_week) &&
    row.is_active &&
    shiftCoversService(row.starts_at, row.ends_at)
  );
}

/** @deprecated Prefer `isLegacyDemoTableLabel` from staging-demo-inventory. */
export function isDemoTableLabel(label: string): boolean {
  return isLegacyDemoTableLabel(label);
}

function totalActiveSeats(tables: RestaurantTableRow[]): number {
  return tables.filter((row) => row.is_active).reduce((sum, row) => sum + row.seat_count, 0);
}

/**
 * Builds a staff-facing checklist from the operations snapshot. Mirrors
 * `assessBookingReadiness` rules plus non-blocking demo inventory warnings.
 */
export function buildOperationsReadinessChecklist(
  snapshot: Pick<
    OperationsSnapshot,
    "businessSettings" | "weeklyHours" | "shifts" | "tables"
  >,
  booking: { live: boolean; reason: string | null },
): ReadinessCheckItem[] {
  const items: ReadinessCheckItem[] = [];

  const timezone = snapshot.businessSettings?.timezone?.trim() ?? "";
  items.push({
    id: "timezone",
    label: "Business timezone",
    status: timezone ? "pass" : "fail",
    detail: timezone
      ? `${timezone} (service dates use this zone).`
      : "No timezone in business_settings. Owners can set it below.",
  });

  const hoursByDay = new Map<number, WeeklyHoursRow[]>();
  for (const row of snapshot.weeklyHours) {
    const list = hoursByDay.get(row.day_of_week) ?? [];
    list.push(row);
    hoursByDay.set(row.day_of_week, list);
  }

  const missingHoursDays = requiredServiceIsoDays.filter((isoDay) => {
    const dayHours = hoursByDay.get(isoDay) ?? [];
    return !dayHours.some((row) => timeCoversService(row.opens_at, row.closes_at));
  });

  items.push({
    id: "weekly-hours",
    label: "Weekly hours (Thu–Sun cellar window)",
    status: missingHoursDays.length === 0 ? "pass" : "fail",
    detail:
      missingHoursDays.length === 0
        ? "Each Thu–Sun row covers 13:00–16:00 in the database."
        : `Missing or short hours for: ${missingHoursDays.map((d) => ISO_WEEKDAY_LABEL[d]).join(", ")}.`,
  });

  const activeShifts = snapshot.shifts.filter((row) => row.is_active);
  const missingActiveShiftDays = requiredServiceIsoDays.filter((isoDay) => {
    const dayShifts = activeShifts.filter((row) => row.day_of_week === isoDay);
    return !dayShifts.some((row) => shiftCoversService(row.starts_at, row.ends_at));
  });

  items.push({
    id: "active-shifts",
    label: "Active service shifts",
    status: missingActiveShiftDays.length === 0 ? "pass" : "fail",
    detail:
      missingActiveShiftDays.length === 0
        ? `${activeShifts.length} active shift(s) cover 13:00–16:00 on Thu–Sun.`
        : `No active shift covers 13:00–16:00 on: ${missingActiveShiftDays.map((d) => ISO_WEEKDAY_LABEL[d]).join(", ")}. Toggle shifts below when cover limits and tables are ready.`,
  });

  const seats = totalActiveSeats(snapshot.tables);
  const activeTableCount = snapshot.tables.filter((row) => row.is_active).length;

  items.push({
    id: "table-seating",
    label: "Active table seating",
    status: seats > 0 ? "pass" : "fail",
    detail:
      seats > 0
        ? `${activeTableCount} active table(s), ${seats} seats total.`
        : "No active tables with seats. Add or activate tables before go-live.",
  });

  const capacityBlock = evaluateSeatingCapacityReadiness(
    activeShifts.map((row) => ({
      day_of_week: row.day_of_week,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      is_active: row.is_active,
      max_covers: row.max_covers,
    })),
    seats,
  );

  items.push({
    id: "cover-capacity",
    label: "Shift cover limits vs seating",
    status: capacityBlock ? "fail" : seats > 0 ? "pass" : "warn",
    detail: capacityBlock
      ? capacityBlock.reason ?? "Cover limits exceed seating."
      : seats > 0
        ? "Each active bookable shift has max_covers at or below total active seats."
        : "Set seating first, then align max_covers on each shift.",
  });

  const inactiveOverLimit = snapshot.shifts.filter(
    (row) =>
      !row.is_active &&
      (requiredServiceIsoDays as readonly number[]).includes(row.day_of_week) &&
      shiftCoversService(row.starts_at, row.ends_at) &&
      row.max_covers > seats &&
      seats > 0,
  );

  if (inactiveOverLimit.length > 0) {
    items.push({
      id: "inactive-shift-covers",
      label: "Inactive shifts with high cover limits",
      status: "warn",
      detail: `${inactiveOverLimit.length} Thu–Sun shift(s) still have max_covers above ${seats} seats. Lower max_covers before activating them or online booking will stay off.`,
    });
  }

  if (isStagingDemoInventory(snapshot.tables)) {
    items.push({
      id: "staging-demo-inventory",
      label: "DEMO / STAGING inventory",
      status: "warn",
      detail:
        "Table 1–8 with 32 staging seats and Lunch max_covers 24. Fictitious layout — confirm real floor plan before production go-live.",
    });
  } else {
    const legacyDemoTables = snapshot.tables.filter((row) => isLegacyDemoTableLabel(row.label));
    if (legacyDemoTables.length > 0) {
      items.push({
        id: "demo-tables",
        label: "Legacy demo floor plan",
        status: "warn",
        detail: `${legacyDemoTables.length} table(s) still use Demo Table … labels. Run supabase/seeds/staging_demo_configuration.sql or replace with farm-confirmed inventory.`,
      });
    }
  }

  items.push({
    id: "public-booking",
    label: "Public online booking",
    status: booking.live ? "pass" : "info",
    detail: booking.live
      ? "Live — guests can submit reservations on /book."
      : booking.reason ??
        "Preview only until all required checks pass and you deliberately enable shifts.",
  });

  return items;
}

/**
 * Blocks manager shift saves that would leave an active bookable shift over seat capacity.
 */
export function validateShiftUpdateAgainstSeating(
  shifts: ServiceShiftRow[],
  tables: RestaurantTableRow[],
  update: { shiftId: string; maxCovers: number; isActive: boolean },
): { ok: true } | { ok: false; message: string } {
  const seats = totalActiveSeats(tables);
  const merged = shifts.map((row) =>
    row.id === update.shiftId
      ? { ...row, max_covers: update.maxCovers, is_active: update.isActive }
      : row,
  );

  const activeBookable = merged.filter(isBookableCellarShift);
  const capacityBlock = evaluateSeatingCapacityReadiness(
    activeBookable.map((row) => ({
      day_of_week: row.day_of_week,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      is_active: row.is_active,
      max_covers: row.max_covers,
    })),
    seats,
  );

  if (capacityBlock) {
    return {
      ok: false,
      message:
        capacityBlock.reason ??
        "Active shift cover limits exceed available seating. Lower max covers or add seats.",
    };
  }

  if (update.isActive && seats < 1) {
    return {
      ok: false,
      message:
        "Cannot activate a service shift until at least one active table with seats is configured.",
    };
  }

  return { ok: true };
}
