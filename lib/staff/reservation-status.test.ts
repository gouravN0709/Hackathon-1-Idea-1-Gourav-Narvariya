import { describe, expect, it } from "vitest";
import {
  capacityHoldingStatuses,
  statusHoldsCapacity,
  suggestedNextStatuses,
} from "@/lib/staff/reservation-status";

describe("statusHoldsCapacity", () => {
  it("matches migration capacity-holding statuses", () => {
    for (const status of capacityHoldingStatuses) {
      expect(statusHoldsCapacity(status)).toBe(true);
    }
    expect(statusHoldsCapacity("cancelled")).toBe(false);
    expect(statusHoldsCapacity("no_show")).toBe(false);
  });
});

describe("suggestedNextStatuses", () => {
  it("documents pending transitions", () => {
    expect(suggestedNextStatuses.pending).toContain("confirmed");
    expect(suggestedNextStatuses.pending).toContain("cancelled");
  });
});
