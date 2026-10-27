import { redirect } from "next/navigation";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { buildStaffLoginUrl } from "@/lib/staff/staff-routes";
import type { StaffAccess } from "@/lib/staff/types";

export type StaffSession = Extract<StaffAccess, { kind: "staff" }>;

export type ProtectedStaffPageResult =
  | { status: "allowed"; session: StaffSession }
  | { status: "denied"; message: string };

export type StaffPageGateResult = ProtectedStaffPageResult | { status: "redirect" };

/** Pure gate evaluation for tests and server pages. */
export function evaluateStaffPageGate(access: StaffAccess): StaffPageGateResult {
  if (access.kind === "signed_out") {
    return { status: "redirect" };
  }

  if (access.kind === "staff") {
    return { status: "allowed", session: access };
  }

  return {
    status: "denied",
    message: access.message,
  };
}

/**
 * Server-only gate for protected staff pages. Redirects signed-out visitors to login.
 */
export async function requireStaffAccess(
  intendedPath: string,
): Promise<ProtectedStaffPageResult> {
  const access = await getStaffAccess();
  const gate = evaluateStaffPageGate(access);

  if (gate.status === "redirect") {
    redirect(buildStaffLoginUrl(intendedPath));
  }

  return gate;
}
