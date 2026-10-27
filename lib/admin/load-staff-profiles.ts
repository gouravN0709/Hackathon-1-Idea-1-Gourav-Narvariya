import type { SupabaseClient } from "@supabase/supabase-js";
import type { StaffRole } from "@/lib/staff/types";

export type AdminStaffProfileRow = {
  id: string;
  userId: string;
  role: StaffRole;
  displayName: string;
  isActive: boolean;
};

function isStaffRole(value: string): value is StaffRole {
  return value === "owner" || value === "manager" || value === "staff";
}

export async function loadAdminStaffProfiles(
  supabase: SupabaseClient,
): Promise<{ rows: AdminStaffProfileRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("id, user_id, role, display_name, is_active")
    .order("role", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    return { rows: [], error: "Could not load staff profiles." };
  }

  const rows = (data ?? []).flatMap((row) => {
    const role = row.role as string;
    if (!isStaffRole(role)) {
      return [];
    }
    return [
      {
        id: row.id as string,
        userId: row.user_id as string,
        role,
        displayName: row.display_name as string,
        isActive: row.is_active as boolean,
      },
    ];
  });

  return { rows, error: null };
}
