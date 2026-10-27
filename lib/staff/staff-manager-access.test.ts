import { describe, expect, it } from "vitest";
import { staffManagerAccessFromStaffAccess } from "@/lib/staff/require-staff-manager-access";

describe("staffManagerAccessFromStaffAccess", () => {
  it("allows owners and managers", () => {
    for (const role of ["owner", "manager"] as const) {
      const result = staffManagerAccessFromStaffAccess({
        kind: "staff",
        userId: "user-1",
        role,
        displayName: "Test",
      });
      expect(result.ok).toBe(true);
    }
  });

  it("denies floor staff", () => {
    const result = staffManagerAccessFromStaffAccess({
      kind: "staff",
      userId: "user-1",
      role: "staff",
      displayName: "Floor",
    });
    expect(result.ok).toBe(false);
  });
});
