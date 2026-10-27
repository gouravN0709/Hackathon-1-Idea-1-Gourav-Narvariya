"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_STAFF_PATH, revalidateAdminPanelPaths } from "@/lib/admin/admin-routes";
import { requireStaffOwnerAccess } from "@/lib/staff/require-staff-owner-access";
import type { StaffRole } from "@/lib/staff/types";
import {
  createAdminClient,
  hasServiceRoleConfiguration,
} from "@/lib/supabase/admin";

export type AdminStaffMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialAdminStaffMutationState: AdminStaffMutationState = {
  success: false,
  error: null,
  message: null,
};

function isStaffRole(value: string): value is StaffRole {
  return value === "owner" || value === "manager" || value === "staff";
}

function revalidateStaffViews() {
  revalidatePath(ADMIN_STAFF_PATH);
  for (const path of revalidateAdminPanelPaths()) {
    revalidatePath(path);
  }
}

export async function updateStaffProfile(
  _prev: AdminStaffMutationState,
  formData: FormData,
): Promise<AdminStaffMutationState> {
  const access = await requireStaffOwnerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  if (!hasServiceRoleConfiguration()) {
    return {
      success: false,
      error:
        "Staff profile changes require SUPABASE_SECRET_KEY on the server. It is not configured.",
      message: null,
    };
  }

  const profileId = String(formData.get("profileId") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "").trim();
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!profileId) {
    return { success: false, error: "Missing staff profile.", message: null };
  }

  if (!isStaffRole(roleRaw)) {
    return { success: false, error: "Invalid role.", message: null };
  }

  if (displayName.length < 1 || displayName.length > 80) {
    return { success: false, error: "Display name must be 1–80 characters.", message: null };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("staff_profiles")
    .update({
      role: roleRaw,
      is_active: isActive,
      display_name: displayName,
    })
    .eq("id", profileId);

  if (error) {
    return {
      success: false,
      error:
        "Could not update staff profile. The database may reject removing the last active owner.",
      message: null,
    };
  }

  revalidateStaffViews();

  return {
    success: true,
    error: null,
    message: "Staff profile updated.",
  };
}
