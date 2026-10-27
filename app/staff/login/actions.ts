"use server";

import { redirect } from "next/navigation";
import { hasPublishableSupabaseConfiguration } from "@/lib/staff/supabase-config";
import { sanitizeStaffNextPath } from "@/lib/staff/staff-routes";
import { createClient } from "@/lib/supabase/server";

export type StaffSignInState = {
  error: string | null;
};

export async function signInStaff(
  _prevState: StaffSignInState,
  formData: FormData,
): Promise<StaffSignInState> {
  if (!hasPublishableSupabaseConfiguration()) {
    return {
      error:
        "Staff sign-in is unavailable because Supabase credentials are not configured.",
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
    return { error: "Sign-in failed. Check your credentials or contact an owner." };
  }

  redirect(sanitizeStaffNextPath(nextRaw));
}

export async function signOutStaff() {
  if (hasPublishableSupabaseConfiguration()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/staff/login");
}
