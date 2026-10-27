import { redirect } from "next/navigation";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import {
  evaluateStaffPageGate,
  type StaffSession,
} from "@/lib/staff/require-staff-access";
import type { StaffAccess } from "@/lib/staff/types";
import { buildAdminLoginUrl } from "@/lib/admin/admin-routes";

export type AdminSession = StaffSession;

export type ProtectedAdminPageResult =
  | { status: "allowed"; session: AdminSession }
  | { status: "denied"; message: string };

export type AdminPageGateResult = ProtectedAdminPageResult | { status: "redirect" };

export function evaluateAdminPageGate(access: StaffAccess): AdminPageGateResult {
  const gate = evaluateStaffPageGate(access);

  if (gate.status === "redirect") {
    return { status: "redirect" };
  }

  if (gate.status === "denied") {
    return { status: "denied", message: gate.message };
  }

  if (gate.session.role === "staff") {
    return {
      status: "denied",
      message:
        "Administrator access is limited to owner and manager profiles. Use the staff panel for floor operations.",
    };
  }

  return { status: "allowed", session: gate.session };
}

export async function requireAdminAccess(
  intendedPath: string,
): Promise<ProtectedAdminPageResult> {
  const access = await getStaffAccess();
  const gate = evaluateAdminPageGate(access);

  if (gate.status === "redirect") {
    redirect(buildAdminLoginUrl(intendedPath));
  }

  return gate;
}

export type AdminAccessResult =
  | { ok: true; session: AdminSession }
  | { ok: false; error: string };

export function adminAccessFromStaffAccess(access: StaffAccess): AdminAccessResult {
  const gate = evaluateAdminPageGate(access);

  if (gate.status === "redirect") {
    return { ok: false, error: "Sign in to access the admin panel." };
  }

  if (gate.status === "denied") {
    return { ok: false, error: gate.message };
  }

  return { ok: true, session: gate.session };
}

export async function requireAdminMutationAccess(): Promise<AdminAccessResult> {
  const access = await getStaffAccess();
  return adminAccessFromStaffAccess(access);
}
