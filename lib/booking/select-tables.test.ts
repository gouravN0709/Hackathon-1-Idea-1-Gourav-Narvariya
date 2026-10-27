import { describe, expect, it } from "vitest";
import { selectTablesForParty } from "@/lib/booking/select-tables";

describe("selectTablesForParty", () => {
  const tables = [
    { id: "a", seat_count: 4 },
    { id: "b", seat_count: 6 },
    { id: "c", seat_count: 8 },
  ];

  it("uses one table when it fits", () => {
    expect(selectTablesForParty(tables, 5)).toEqual(["b"]);
  });

  it("combines tables when needed", () => {
    const picked = selectTablesForParty(tables, 10);
    expect(picked).not.toBeNull();
    expect(picked?.length).toBeGreaterThan(1);
  });

  it("returns null when capacity is insufficient", () => {
    expect(selectTablesForParty(tables, 20)).toBeNull();
  });
});
