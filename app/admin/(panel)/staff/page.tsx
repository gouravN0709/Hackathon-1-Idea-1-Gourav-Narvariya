import { connection } from "next/server";
import { AdminStaffTable } from "@/components/admin/admin-staff-table";
import { loadAdminStaffProfiles } from "@/lib/admin/load-staff-profiles";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { staffOwnerAccessFromStaffAccess } from "@/lib/staff/require-staff-owner-access";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminStaffPage() {
  await connection();
  const staffAccess = await getStaffAccess();
  const ownerGate = staffOwnerAccessFromStaffAccess(staffAccess);

  const supabase = await createClient();
  const { rows, error } = await loadAdminStaffProfiles(supabase);

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Staff & permissions
        </h1>
        <p className="mt-space-xs max-w-3xl text-[#424842]">
          Roles live in <span className="font-medium">staff_profiles</span>. Owners and
          managers access this admin panel; floor staff use{" "}
          <span className="font-medium">/staff</span> only.
        </p>
      </header>

      {error ? (
        <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
          {error}
        </p>
      ) : (
        <AdminStaffTable
          rows={rows}
          canMutate={ownerGate.ok}
          ownerOnlyMessage={
            ownerGate.ok
              ? undefined
              : "Only owners can change staff roles and activation. Managers can view the roster."
          }
        />
      )}
    </div>
  );
}
