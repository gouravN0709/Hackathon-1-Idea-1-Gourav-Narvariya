import { getStaffAccess } from "@/lib/staff/get-staff-access";
import {
  evaluateStaffPageGate,
  type StaffSession,
} from "@/lib/staff/require-staff-access";
import type { StaffAccess } from "@/lib/staff/types";

export type StaffManagerAccessResult =
  | { ok: true; session: StaffSession }
  | { ok: false; error: string };

export function staffManagerAccessFromStaffAccess(
  access: StaffAccess,
): StaffManagerAccessResult {
  const gate = evaluateStaffPageGate(access);

  if (gate.status === "redirect") {
    return { ok: false, error: "Sign in to manage restaurant operations." };
  }

  if (gate.status === "denied") {
    return { ok: false, error: gate.message };
  }

  if (gate.session.role === "staff") {
    return {
      ok: false,
      error:
        "Operational settings are limited to owners and managers. Ask a manager if you need a closure or table change.",
    };
  }

  return { ok: true, session: gate.session };
}

export async function requireStaffManagerAccess(): Promise<StaffManagerAccessResult> {
  const access = await getStaffAccess();
  return staffManagerAccessFromStaffAccess(access);
}
