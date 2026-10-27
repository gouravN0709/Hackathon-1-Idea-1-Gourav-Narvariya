import type { ServiceShiftRow, WeeklyHoursRow } from "@/lib/staff/load-operations-snapshot";

export type WeeklyHoursDraft = {
  id?: string;
  day_of_week: number;
  opens_at: string;
  closes_at: string;
};

const TIME_INPUT_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/** Normalize HTML time input or DB `time` string to `HH:MM:SS` for comparisons. */
export function normalizeTimeValue(raw: string): string | null {
  const trimmed = raw.trim();
  const fromDb = trimmed.length >= 8 ? trimmed.slice(0, 8) : trimmed;
  const match = TIME_INPUT_RE.exec(fromDb);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export function timeToSeconds(normalized: string): number {
  const [h, m, s] = normalized.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

/** Half-open interval overlap, matching Postgres `[)` ranges on weekly_hours. */
export function timeRangesOverlap(
  openA: string,
  closeA: string,
  openB: string,
  closeB: string,
): boolean {
  const a0 = timeToSeconds(openA);
  const a1 = timeToSeconds(closeA);
  const b0 = timeToSeconds(openB);
  const b1 = timeToSeconds(closeB);
  return a0 < b1 && b0 < a1;
}

export function parseIsoWeekday(raw: string): number | null {
  const day = Number(raw);
  if (!Number.isInteger(day) || day < 1 || day > 7) {
    return null;
  }
  return day;
}

export function weeklyHoursDraftFromInput(input: {
  dayOfWeek: string;
  opensAt: string;
  closesAt: string;
}):
  | { ok: true; value: WeeklyHoursDraft }
  | { ok: false; message: string } {
  const day_of_week = parseIsoWeekday(input.dayOfWeek.trim());
  if (!day_of_week) {
    return { ok: false, message: "Choose a weekday (Monday–Sunday)." };
  }

  const opens_at = normalizeTimeValue(input.opensAt);
  const closes_at = normalizeTimeValue(input.closesAt);
  if (!opens_at || !closes_at) {
    return { ok: false, message: "Enter valid open and close times." };
  }

  if (timeToSeconds(opens_at) >= timeToSeconds(closes_at)) {
    return { ok: false, message: "Close time must be after open time." };
  }

  return { ok: true, value: { day_of_week, opens_at, closes_at } };
}

function rowToDraft(row: WeeklyHoursRow): WeeklyHoursDraft {
  return {
    id: row.id,
    day_of_week: row.day_of_week,
    opens_at: normalizeTimeValue(row.opens_at) ?? row.opens_at,
    closes_at: normalizeTimeValue(row.closes_at) ?? row.closes_at,
  };
}

export function applyWeeklyHoursDraft(
  existing: WeeklyHoursRow[],
  draft: WeeklyHoursDraft,
): WeeklyHoursDraft[] {
  const base = existing.map(rowToDraft);
  if (draft.id) {
    return base.map((row) => (row.id === draft.id ? { ...draft, id: draft.id } : row));
  }
  return [...base, draft];
}

export function removeWeeklyHoursRow(
  existing: WeeklyHoursRow[],
  rowId: string,
): WeeklyHoursDraft[] {
  return existing.filter((row) => row.id !== rowId).map(rowToDraft);
}

export function weeklyHoursSetHasOverlap(rows: WeeklyHoursDraft[]): boolean {
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i];
      const b = rows[j];
      if (a.day_of_week !== b.day_of_week) {
        continue;
      }
      if (timeRangesOverlap(a.opens_at, a.closes_at, b.opens_at, b.closes_at)) {
        return true;
      }
    }
  }
  return false;
}

export function activeShiftsOutsideWeeklyHours(
  rows: WeeklyHoursDraft[],
  shifts: Pick<ServiceShiftRow, "name" | "day_of_week" | "starts_at" | "ends_at" | "is_active">[],
): string | null {
  for (const shift of shifts) {
    if (!shift.is_active) {
      continue;
    }

    const starts = normalizeTimeValue(shift.starts_at);
    const ends = normalizeTimeValue(shift.ends_at);
    if (!starts || !ends) {
      continue;
    }

    const covered = rows.some(
      (hours) =>
        hours.day_of_week === shift.day_of_week &&
        hours.opens_at <= starts &&
        hours.closes_at >= ends,
    );

    if (!covered) {
      return `Active shift “${shift.name}” would fall outside weekly hours. Adjust shifts or widen hours first.`;
    }
  }

  return null;
}

export type WeeklyHoursPreview = {
  ok: boolean;
  overlap: boolean;
  shiftConflict: string | null;
};

export function previewWeeklyHoursChange(
  existing: WeeklyHoursRow[],
  shifts: ServiceShiftRow[],
  draft: WeeklyHoursDraft,
): WeeklyHoursPreview {
  const next = applyWeeklyHoursDraft(existing, draft);
  const overlap = weeklyHoursSetHasOverlap(next);
  const shiftConflict = activeShiftsOutsideWeeklyHours(next, shifts);
  return {
    ok: !overlap && !shiftConflict,
    overlap,
    shiftConflict,
  };
}

export function previewWeeklyHoursDelete(
  existing: WeeklyHoursRow[],
  shifts: ServiceShiftRow[],
  rowId: string,
): WeeklyHoursPreview {
  const next = removeWeeklyHoursRow(existing, rowId);
  const shiftConflict = activeShiftsOutsideWeeklyHours(next, shifts);
  return {
    ok: !shiftConflict,
    overlap: false,
    shiftConflict,
  };
}

export function validateWeeklyHoursMutation(
  existing: WeeklyHoursRow[],
  shifts: ServiceShiftRow[],
  draft: WeeklyHoursDraft,
): { ok: true } | { ok: false; message: string } {
  const preview = previewWeeklyHoursChange(existing, shifts, draft);
  if (preview.overlap) {
    return {
      ok: false,
      message: "These hours overlap another block on the same day.",
    };
  }
  if (preview.shiftConflict) {
    return { ok: false, message: preview.shiftConflict };
  }
  return { ok: true };
}

export function validateWeeklyHoursDelete(
  existing: WeeklyHoursRow[],
  shifts: ServiceShiftRow[],
  rowId: string,
): { ok: true } | { ok: false; message: string } {
  const preview = previewWeeklyHoursDelete(existing, shifts, rowId);
  if (preview.shiftConflict) {
    return { ok: false, message: preview.shiftConflict };
  }
  return { ok: true };
}

export function mapWeeklyHoursDbErrorMessage(code: string | undefined, message: string): string {
  if (code === "23P01" || message.includes("weekly_hours_no_overlap")) {
    return "These hours overlap another block on the same day.";
  }
  if (message.includes("shift falls outside weekly hours")) {
    return "Active shifts would fall outside these hours. Adjust shifts first or widen hours.";
  }
  return "Could not save weekly hours. Check times and try again.";
}
