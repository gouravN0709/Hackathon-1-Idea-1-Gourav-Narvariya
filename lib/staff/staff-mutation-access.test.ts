import { describe, expect, it } from "vitest";
import { staffMutationAccessFromStaffAccess } from "@/lib/staff/staff-mutation-access";
import { mapReservationMutationSupabaseError } from "@/lib/staff/map-reservation-mutation-error";

describe("staffMutationAccessFromStaffAccess", () => {
  it("denies signed-out users", () => {
    const result = staffMutationAccessFromStaffAccess({ kind: "signed_out" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/sign in/i);
    }
  });

  it("denies missing profiles", () => {
    const result = staffMutationAccessFromStaffAccess({
      kind: "forbidden",
      reason: "no_profile",
      message: "No staff profile.",
    });
    expect(result.ok).toBe(false);
  });

  it("denies inactive profiles", () => {
    const result = staffMutationAccessFromStaffAccess({
      kind: "forbidden",
      reason: "inactive_profile",
      message: "Inactive.",
    });
    expect(result.ok).toBe(false);
  });

  it("denies invalid roles", () => {
    const result = staffMutationAccessFromStaffAccess({
      kind: "forbidden",
      reason: "invalid_role",
      message: "Invalid role.",
    });
    expect(result.ok).toBe(false);
  });

  it("allows active owner, manager, and staff", () => {
    for (const role of ["owner", "manager", "staff"] as const) {
      const result = staffMutationAccessFromStaffAccess({
        kind: "staff",
        userId: "user-1",
        role,
        displayName: "Test",
      });
      expect(result.ok).toBe(true);
    }
  });
});

describe("mapReservationMutationSupabaseError", () => {
  it("maps permission and not-found codes safely", () => {
    expect(mapReservationMutationSupabaseError({ code: "PGRST116" }).code).toBe(
      "not_found",
    );
    expect(mapReservationMutationSupabaseError({ code: "42501" }).code).toBe(
      "forbidden",
    );
    expect(
      mapReservationMutationSupabaseError({
        message: "service is full for this shift",
      }).code,
    ).toBe("unavailable");
  });

  it("does not expose raw SQL details in the default server message", () => {
    const mapped = mapReservationMutationSupabaseError({
      message: 'duplicate key value violates unique constraint "foo"',
    });
    expect(mapped.message).not.toContain("duplicate key");
    expect(mapped.code).toBe("server");
  });
});
