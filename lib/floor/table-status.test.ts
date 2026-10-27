import { describe, expect, it } from "vitest";
import {
  canTransitionTableStatus,
  resolveTableOperationalStatus,
} from "@/lib/floor/table-status";

describe("resolveTableOperationalStatus", () => {
  it("marks inactive tables as blocked", () => {
    expect(
      resolveTableOperationalStatus({
        isActive: false,
        hasActiveAssignment: true,
        storedStatus: "occupied",
      }).status,
    ).toBe("blocked");
  });

  it("prefers stored state over assignment inference", () => {
    expect(
      resolveTableOperationalStatus({
        isActive: true,
        hasActiveAssignment: true,
        storedStatus: "arrived",
      }).status,
    ).toBe("arrived");
  });

  it("infers reserved from assignment when no stored state", () => {
    expect(
      resolveTableOperationalStatus({
        isActive: true,
        hasActiveAssignment: true,
        storedStatus: null,
      }).status,
    ).toBe("reserved");
  });
});

describe("canTransitionTableStatus", () => {
  it("allows cleaning to available", () => {
    expect(canTransitionTableStatus("cleaning", "available")).toBe(true);
  });

  it("blocks occupied to available without cleaning", () => {
    expect(canTransitionTableStatus("occupied", "available")).toBe(false);
  });

  it("allows reserved to occupied for direct seating", () => {
    expect(canTransitionTableStatus("reserved", "occupied")).toBe(true);
  });
});
