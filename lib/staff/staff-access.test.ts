import { afterEach, describe, expect, it, vi } from "vitest";
import { interpretStaffAccess } from "@/lib/staff/interpret-staff-access";
import { evaluateStaffPageGate } from "@/lib/staff/require-staff-access";
import { resolveStaffReservationViewState } from "@/lib/staff/reservation-view-state";
import { sampleStaffReservations } from "@/lib/staff/sample-reservations";
import {
  buildStaffLoginUrl,
  isStaffDemoReservationsEnabled,
  isStaffPathRequiringAuthSession,
  sanitizeStaffNextPath,
} from "@/lib/staff/staff-routes";

describe("sanitizeStaffNextPath", () => {
  it("defaults invalid paths to reservations", () => {
    expect(sanitizeStaffNextPath("/book")).toBe("/staff/reservations");
    expect(sanitizeStaffNextPath("https://evil.test/staff/reservations")).toBe(
      "/staff/reservations",
    );
  });

  it("preserves safe staff paths and query strings", () => {
    expect(sanitizeStaffNextPath("/staff/reservations?date=2026-11-07")).toBe(
      "/staff/reservations?date=2026-11-07",
    );
  });

  it("blocks login as a post-sign-in destination", () => {
    expect(sanitizeStaffNextPath("/staff/login")).toBe("/staff/reservations");
    expect(sanitizeStaffNextPath("/staff/login?next=/staff/reservations")).toBe(
      "/staff/reservations",
    );
  });
});

describe("buildStaffLoginUrl", () => {
  it("encodes the intended destination", () => {
    expect(buildStaffLoginUrl("/staff/reservations?status=pending")).toBe(
      "/staff/login?next=%2Fstaff%2Freservations%3Fstatus%3Dpending",
    );
  });
});

describe("isStaffPathRequiringAuthSession", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows the login page without a session", () => {
    expect(isStaffPathRequiringAuthSession("/staff/login")).toBe(false);
  });

  it("requires a session for reservations", () => {
    expect(isStaffPathRequiringAuthSession("/staff/reservations")).toBe(true);
  });

  it("allows demo reservations only when demo mode is enabled", () => {
    vi.stubEnv("STAFF_DEMO_RESERVATIONS", "");
    expect(isStaffPathRequiringAuthSession("/staff/demo/reservations")).toBe(
      true,
    );

    vi.stubEnv("STAFF_DEMO_RESERVATIONS", "true");
    expect(isStaffDemoReservationsEnabled()).toBe(true);
    expect(isStaffPathRequiringAuthSession("/staff/demo/reservations")).toBe(
      false,
    );
  });
});

describe("interpretStaffAccess", () => {
  const activeProfile = {
    role: "staff",
    display_name: "Maite",
    is_active: true,
  };

  it("redirects signed-out visitors at the page gate", () => {
    const access = interpretStaffAccess({
      hasConfiguration: true,
      userId: null,
      profile: null,
      profileLookupFailed: false,
    });
    expect(evaluateStaffPageGate(access)).toEqual({ status: "redirect" });
  });

  it("denies authenticated users without a staff profile", () => {
    const access = interpretStaffAccess({
      hasConfiguration: true,
      userId: "user-1",
      profile: null,
      profileLookupFailed: false,
    });
    expect(evaluateStaffPageGate(access)).toMatchObject({
      status: "denied",
      message: expect.stringContaining("no staff profile"),
    });
  });

  it("denies inactive staff profiles", () => {
    const access = interpretStaffAccess({
      hasConfiguration: true,
      userId: "user-1",
      profile: { ...activeProfile, is_active: false },
      profileLookupFailed: false,
    });
    expect(evaluateStaffPageGate(access).status).toBe("denied");
    if (access.kind === "forbidden") {
      expect(access.reason).toBe("inactive_profile");
    }
  });

  it("allows active staff members", () => {
    const access = interpretStaffAccess({
      hasConfiguration: true,
      userId: "user-1",
      profile: activeProfile,
      profileLookupFailed: false,
    });
    expect(evaluateStaffPageGate(access)).toEqual({
      status: "allowed",
      session: {
        kind: "staff",
        userId: "user-1",
        role: "staff",
        displayName: "Maite",
      },
    });
  });
});

describe("resolveStaffReservationViewState", () => {
  const staffSession = {
    kind: "staff" as const,
    userId: "user-1",
    role: "staff" as const,
    displayName: "Maite",
  };

  it("never returns sample data when the database load fails", () => {
    const view = resolveStaffReservationViewState(staffSession, {
      rows: [],
      error: "Could not load reservations.",
    });
    expect(view.rows).toEqual([]);
    expect(view.error).toBe("Could not load reservations.");
    expect(view.rows).not.toEqual(sampleStaffReservations);
  });

  it("returns empty data for denied access", () => {
    const view = resolveStaffReservationViewState(
      {
        kind: "forbidden",
        reason: "no_profile",
        message: "denied",
      },
      { rows: sampleStaffReservations, error: null },
    );
    expect(view.rows).toEqual([]);
    expect(view.error).toBeNull();
  });

  it("returns live rows for active staff when load succeeds", () => {
    const liveRow = {
      ...sampleStaffReservations[0],
      id: "00000000-0000-4000-8000-000000000099",
      guestDisplayName: "Live Guest",
    };
    const view = resolveStaffReservationViewState(staffSession, {
      rows: [liveRow],
      error: null,
    });
    expect(view.rows).toHaveLength(1);
    expect(view.rows[0]?.guestDisplayName).toBe("Live Guest");
  });
});
