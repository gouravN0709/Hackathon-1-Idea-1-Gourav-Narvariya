import type { StaffAccess, StaffRole } from "@/lib/staff/types";

export type StaffProfileSnapshot = {
  role: string;
  display_name: string;
  is_active: boolean;
};

function isStaffRole(value: string): value is StaffRole {
  return value === "owner" || value === "manager" || value === "staff";
}

export function interpretStaffAccess(input: {
  hasConfiguration: boolean;
  userId: string | null;
  profile: StaffProfileSnapshot | null;
  profileLookupFailed: boolean;
}): StaffAccess {
  if (!input.hasConfiguration) {
    return {
      kind: "configuration_missing",
      message:
        "Staff sign-in is unavailable because Supabase publishable credentials are not configured.",
    };
  }

  if (!input.userId) {
    return { kind: "signed_out" };
  }

  if (input.profileLookupFailed) {
    return {
      kind: "forbidden",
      reason: "profile_lookup_failed",
      message:
        "Could not verify your staff profile. Try again or contact an owner.",
    };
  }

  if (!input.profile) {
    return {
      kind: "forbidden",
      reason: "no_profile",
      message:
        "Your account is signed in but has no staff profile. Ask an owner to add you in staff_profiles.",
    };
  }

  if (!input.profile.is_active) {
    return {
      kind: "forbidden",
      reason: "inactive_profile",
      message:
        "Your staff profile is inactive. Ask an owner to re-enable your access.",
    };
  }

  if (!isStaffRole(input.profile.role)) {
    return {
      kind: "forbidden",
      reason: "invalid_role",
      message: "Your staff profile has an unsupported role.",
    };
  }

  return {
    kind: "staff",
    userId: input.userId,
    role: input.profile.role,
    displayName: input.profile.display_name,
  };
}
