import { describe, expect, it } from "vitest";
import {
  applyWeeklyHoursDraft,
  weeklyHoursSetHasOverlap,
  previewWeeklyHoursChange,
  previewWeeklyHoursDelete,
  timeRangesOverlap,
  validateWeeklyHoursMutation,
  weeklyHoursDraftFromInput,
} from "@/lib/staff/weekly-hours-validation";
import type { ServiceShiftRow, WeeklyHoursRow } from "@/lib/staff/load-operations-snapshot";

const existing: WeeklyHoursRow[] = [
  { id: "a", day_of_week: 4, opens_at: "13:00:00", closes_at: "16:00:00" },
];

const shifts: ServiceShiftRow[] = [
  {
    id: "s1",
    name: "Txotx",
    day_of_week: 4,
    starts_at: "13:30:00",
    ends_at: "15:30:00",
    max_covers: 40,
    is_active: true,
  },
];

describe("timeRangesOverlap", () => {
  it("detects half-open overlap", () => {
    expect(timeRangesOverlap("13:00:00", "16:00:00", "15:00:00", "17:00:00")).toBe(true);
    expect(timeRangesOverlap("13:00:00", "16:00:00", "16:00:00", "18:00:00")).toBe(false);
  });
});

describe("weeklyHoursDraftFromInput", () => {
  it("parses HTML time values", () => {
    const parsed = weeklyHoursDraftFromInput({
      dayOfWeek: "4",
      opensAt: "13:00",
      closesAt: "16:00",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.opens_at).toBe("13:00:00");
    }
  });
});

describe("previewWeeklyHoursChange", () => {
  it("flags overlap on the same weekday", () => {
    const draft = weeklyHoursDraftFromInput({
      dayOfWeek: "4",
      opensAt: "14:00",
      closesAt: "17:00",
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) {
      return;
    }
    const preview = previewWeeklyHoursChange(existing, shifts, draft.value);
    expect(preview.overlap).toBe(true);
    expect(preview.ok).toBe(false);
  });

  it("flags shifts that would be uncovered", () => {
    const draft = weeklyHoursDraftFromInput({
      dayOfWeek: "4",
      opensAt: "14:00",
      closesAt: "16:00",
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) {
      return;
    }
    const withId = { ...draft.value, id: "a" };
    const preview = previewWeeklyHoursChange(existing, shifts, withId);
    expect(preview.shiftConflict).toMatch(/Txotx/);
  });

  it("accepts a non-overlapping second block", () => {
    const draft = weeklyHoursDraftFromInput({
      dayOfWeek: "4",
      opensAt: "18:00",
      closesAt: "21:00",
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) {
      return;
    }
    const preview = previewWeeklyHoursChange(existing, shifts, draft.value);
    expect(preview.ok).toBe(true);
  });
});

describe("validateWeeklyHoursMutation", () => {
  it("blocks delete when shift would be orphaned", () => {
    const result = previewWeeklyHoursDelete(existing, shifts, "a");
    expect(result.ok).toBe(false);
    expect(result.shiftConflict).toBeTruthy();
  });

  it("allows update that keeps shift covered", () => {
    const draft = { id: "a", day_of_week: 4, opens_at: "13:00:00", closes_at: "17:00:00" };
    const next = applyWeeklyHoursDraft(existing, draft);
    expect(weeklyHoursSetHasOverlap(next)).toBe(false);
    expect(validateWeeklyHoursMutation(existing, shifts, draft).ok).toBe(true);
  });
});
