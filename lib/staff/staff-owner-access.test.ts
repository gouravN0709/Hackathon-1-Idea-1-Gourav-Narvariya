import { describe, expect, it } from "vitest";
import { staffOwnerAccessFromStaffAccess } from "@/lib/staff/require-staff-owner-access";

describe("staffOwnerAccessFromStaffAccess", () => {
  it("allows owners only", () => {
    const owner = staffOwnerAccessFromStaffAccess({
      kind: "staff",
      userId: "u1",
      role: "owner",
      displayName: "Owner",
    });
    expect(owner.ok).toBe(true);

    const manager = staffOwnerAccessFromStaffAccess({
      kind: "staff",
      userId: "u2",
      role: "manager",
      displayName: "Manager",
    });
    expect(manager.ok).toBe(false);
  });
});
