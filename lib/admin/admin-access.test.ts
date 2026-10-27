import { describe, expect, it } from "vitest";
import { evaluateAdminPageGate } from "@/lib/admin/require-admin-access";
import { sanitizeAdminNextPath } from "@/lib/admin/admin-routes";

describe("sanitizeAdminNextPath", () => {
  it("defaults invalid paths to admin home", () => {
    expect(sanitizeAdminNextPath("/staff/reservations")).toBe("/admin");
    expect(sanitizeAdminNextPath("/admin/login")).toBe("/admin");
  });

  it("preserves safe admin paths", () => {
    expect(sanitizeAdminNextPath("/admin/reservations?status=pending")).toBe(
      "/admin/reservations?status=pending",
    );
    expect(sanitizeAdminNextPath("/admin/floor-plan")).toBe("/admin/floor-plan");
  });
});

describe("evaluateAdminPageGate", () => {
  it("denies floor staff", () => {
    const gate = evaluateAdminPageGate({
      kind: "staff",
      userId: "u1",
      role: "staff",
      displayName: "Floor",
    });
    expect(gate.status).toBe("denied");
  });

  it("allows managers and owners", () => {
    for (const role of ["owner", "manager"] as const) {
      const gate = evaluateAdminPageGate({
        kind: "staff",
        userId: "u1",
        role,
        displayName: "Admin",
      });
      expect(gate.status).toBe("allowed");
    }
  });
});
