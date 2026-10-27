import { describe, expect, it } from "vitest";
import {
  isLegacyDemoTableLabel,
  isStagingDemoInventory,
} from "@/lib/booking/staging-demo-inventory";
import type { RestaurantTableRow } from "@/lib/staff/load-operations-snapshot";

const stagingTable = (sortOrder: number): RestaurantTableRow => ({
  id: `t-${sortOrder}`,
  label: `Table ${sortOrder}`,
  seat_count: sortOrder <= 4 ? 2 : 6,
  is_active: true,
  sort_order: sortOrder,
});

describe("isLegacyDemoTableLabel", () => {
  it("detects legacy demo seed labels", () => {
    expect(isLegacyDemoTableLabel("Demo Table 01")).toBe(true);
    expect(isLegacyDemoTableLabel("Table 1")).toBe(false);
  });
});

describe("isStagingDemoInventory", () => {
  it("accepts the approved eight-table staging layout", () => {
    expect(isStagingDemoInventory([1, 2, 3, 4, 5, 6, 7, 8].map(stagingTable))).toBe(true);
  });

  it("rejects wrong seat totals", () => {
    const tables = [1, 2, 3, 4, 5, 6, 7, 8].map(stagingTable);
    tables[0] = { ...tables[0], seat_count: 4 };
    expect(isStagingDemoInventory(tables)).toBe(false);
  });
});
