import { describe, expect, it } from "vitest";
import {
  buildOperationsReadinessChecklist,
  isDemoTableLabel,
  validateShiftUpdateAgainstSeating,
} from "@/lib/booking/operations-readiness-checklist";
import type {
  RestaurantTableRow,
  ServiceShiftRow,
} from "@/lib/staff/load-operations-snapshot";

const lunchShift = (day: number, active: boolean, maxCovers: number): ServiceShiftRow => ({
  id: `shift-${day}`,
  name: "Lunch",
  day_of_week: day,
  starts_at: "13:00:00",
  ends_at: "16:00:00",
  max_covers: maxCovers,
  is_active: active,
});

const demoTable = (n: number): RestaurantTableRow => ({
  id: `t-${n}`,
  label: `Demo Table ${String(n).padStart(2, "0")}`,
  seat_count: 4,
  is_active: true,
  sort_order: n,
});

describe("isDemoTableLabel", () => {
  it("detects demo seed labels", () => {
    expect(isDemoTableLabel("Demo Table 01")).toBe(true);
    expect(isDemoTableLabel("Table 12")).toBe(false);
  });
});

describe("buildOperationsReadinessChecklist", () => {
  it("warns on staging demo inventory when configured", () => {
    const snapshot = {
      businessSettings: { id: "bs", timezone: "Europe/Madrid" },
      weeklyHours: [4, 5, 6, 7].map((day_of_week) => ({
        id: `h-${day_of_week}`,
        day_of_week,
        opens_at: "13:00:00",
        closes_at: "16:00:00",
      })),
      shifts: [4, 5, 6, 7].map((day) => lunchShift(day, true, 24)),
      tables: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
        id: `t-${n}`,
        label: `Table ${n}`,
        seat_count: n <= 4 ? 2 : 6,
        is_active: true,
        sort_order: n,
      })),
    };

    const items = buildOperationsReadinessChecklist(snapshot, {
      live: true,
      reason: null,
    });

    expect(items.find((i) => i.id === "staging-demo-inventory")?.status).toBe("warn");
    expect(items.find((i) => i.id === "active-shifts")?.status).toBe("pass");
  });

  it("matches legacy staging blockers (inactive shifts, demo tables)", () => {
    const snapshot = {
      businessSettings: { id: "bs", timezone: "Europe/Madrid" },
      weeklyHours: [4, 5, 6, 7].map((day_of_week) => ({
        id: `h-${day_of_week}`,
        day_of_week,
        opens_at: "13:00:00",
        closes_at: "16:00:00",
      })),
      shifts: [4, 5, 6, 7].map((day) => lunchShift(day, false, 500)),
      tables: [1, 2, 3, 4, 5, 6, 7, 8].map(demoTable),
    };

    const items = buildOperationsReadinessChecklist(snapshot, {
      live: false,
      reason: "Active service shifts for cellar days are not configured in the database.",
    });

    expect(items.find((i) => i.id === "active-shifts")?.status).toBe("fail");
    expect(items.find((i) => i.id === "demo-tables")?.status).toBe("warn");
    expect(items.find((i) => i.id === "inactive-shift-covers")?.status).toBe("warn");
    expect(items.find((i) => i.id === "cover-capacity")?.status).toBe("pass");
  });
});

describe("validateShiftUpdateAgainstSeating", () => {
  const tables = [demoTable(1), demoTable(2)];
  const shifts = [lunchShift(4, false, 500)];

  it("rejects activating a shift when max_covers exceeds seats", () => {
    const result = validateShiftUpdateAgainstSeating(shifts, tables, {
      shiftId: "shift-4",
      maxCovers: 500,
      isActive: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("more covers than active table seating");
    }
  });

  it("allows lowering max_covers then activating", () => {
    const result = validateShiftUpdateAgainstSeating(shifts, tables, {
      shiftId: "shift-4",
      maxCovers: 8,
      isActive: true,
    });

    expect(result).toEqual({ ok: true });
  });
});
