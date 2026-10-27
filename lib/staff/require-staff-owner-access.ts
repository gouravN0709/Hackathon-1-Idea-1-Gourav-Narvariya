import { getStaffAccess } from "@/lib/staff/get-staff-access";
import {
  evaluateStaffPageGate,
  type StaffSession,
} from "@/lib/staff/require-staff-access";
import type { StaffAccess } from "@/lib/staff/types";

export type StaffOwnerAccessResult =
  | { ok: true; session: StaffSession }
  | { ok: false; error: string };

export function staffOwnerAccessFromStaffAccess(
  access: StaffAccess,
): StaffOwnerAccessResult {
  const gate = evaluateStaffPageGate(access);

  if (gate.status === "redirect") {
    return { ok: false, error: "Sign in to manage business settings." };
  }

  if (gate.status === "denied") {
    return { ok: false, error: gate.message };
  }

  if (gate.session.role !== "owner") {
    return {
      ok: false,
      error:
        "Business timezone can only be changed by an owner profile. Managers can view the current setting.",
    };
  }

  return { ok: true, session: gate.session };
}

export async function requireStaffOwnerAccess(): Promise<StaffOwnerAccessResult> {
  const access = await getStaffAccess();
  return staffOwnerAccessFromStaffAccess(access);
}
