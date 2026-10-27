import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { evaluateStaffPageGate } from "@/lib/staff/require-staff-access";
import type { StaffAccess } from "@/lib/staff/types";
import type { StaffSession } from "@/lib/staff/require-staff-access";

export type StaffMutationAccessResult =
  | { ok: true; session: StaffSession }
  | { ok: false; error: string };

export function staffMutationAccessFromStaffAccess(
  access: StaffAccess,
): StaffMutationAccessResult {
  const gate = evaluateStaffPageGate(access);

  if (gate.status === "redirect") {
    return { ok: false, error: "Sign in to update reservations." };
  }

  if (gate.status === "denied") {
    return { ok: false, error: gate.message };
  }

  return { ok: true, session: gate.session };
}

export async function requireStaffMutationAccess(): Promise<StaffMutationAccessResult> {
  const access = await getStaffAccess();
  return staffMutationAccessFromStaffAccess(access);
}
