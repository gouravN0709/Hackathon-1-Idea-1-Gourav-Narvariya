import { connection } from "next/server";
import { redirect } from "next/navigation";
import { StaffContextBanner } from "@/components/staff/staff-context-banner";
import { StaffLoginForm } from "@/components/staff/staff-login-form";
import { SiteContainer } from "@/components/ui/site-container";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { sanitizeStaffNextPath } from "@/lib/staff/staff-routes";

type StaffLoginPageContentProps = {
  nextPath: string;
};

export async function StaffLoginPageContent({
  nextPath,
}: StaffLoginPageContentProps) {
  await connection();
  const access = await getStaffAccess();
  if (access.kind === "staff") {
    redirect(sanitizeStaffNextPath(nextPath));
  }

  const configurationMissing = access.kind === "configuration_missing";

  return (
    <>
      <SiteContainer className="pt-space-lg">
        <StaffContextBanner
          mode={configurationMissing ? "denied" : "info"}
          message={
            configurationMissing
              ? access.message
              : "Sign in with Supabase Auth. Reservation data requires an active staff_profiles row."
          }
        />
      </SiteContainer>
      <StaffLoginForm
        nextPath={sanitizeStaffNextPath(nextPath)}
        disabled={configurationMissing}
      />
    </>
  );
}
