"use server";

import { redirect } from "next/navigation";
import { sanitizeAdminNextPath } from "@/lib/admin/admin-routes";
import { adminAccessFromStaffAccess } from "@/lib/admin/require-admin-access";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { hasPublishableSupabaseConfiguration } from "@/lib/staff/supabase-config";
import { createClient } from "@/lib/supabase/server";

export type AdminSignInState = {
  error: string | null;
};

export async function signInAdmin(
  _prevState: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  if (!hasPublishableSupabaseConfiguration()) {
    return {
      error:
        "Admin sign-in is unavailable because Supabase credentials are not configured.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "Sign-in failed. Check your credentials or contact an owner.",
    };
  }

  const access = await getStaffAccess();
  const adminGate = adminAccessFromStaffAccess(access);
  if (!adminGate.ok) {
    await supabase.auth.signOut();
    return { error: adminGate.error };
  }

  redirect(sanitizeAdminNextPath(nextRaw));
}

export async function signOutAdmin() {
  if (hasPublishableSupabaseConfiguration()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
