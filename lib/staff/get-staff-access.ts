import { interpretStaffAccess } from "@/lib/staff/interpret-staff-access";
import { hasPublishableSupabaseConfiguration } from "@/lib/staff/supabase-config";
import type { StaffAccess } from "@/lib/staff/types";
import { createClient } from "@/lib/supabase/server";

export { hasPublishableSupabaseConfiguration };

export async function getStaffAccess(): Promise<StaffAccess> {
  const hasConfiguration = hasPublishableSupabaseConfiguration();

  if (!hasConfiguration) {
    return interpretStaffAccess({
      hasConfiguration: false,
      userId: null,
      profile: null,
      profileLookupFailed: false,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return interpretStaffAccess({
      hasConfiguration: true,
      userId: null,
      profile: null,
      profileLookupFailed: false,
    });
  }

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("role, display_name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  return interpretStaffAccess({
    hasConfiguration: true,
    userId: user.id,
    profile: profile ?? null,
    profileLookupFailed: Boolean(profileError),
  });
}
