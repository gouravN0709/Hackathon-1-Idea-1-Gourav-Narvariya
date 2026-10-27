import { connection } from "next/server";
import Link from "next/link";
import { signOutStaff } from "@/app/staff/login/actions";
import { StaffContextBanner } from "@/components/staff/staff-context-banner";
import { StaffOperationsDashboard } from "@/components/staff/staff-operations-dashboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteContainer } from "@/components/ui/site-container";
import { buildOperationsReadinessChecklist } from "@/lib/booking/operations-readiness-checklist";
import { isStagingDemoInventory } from "@/lib/booking/staging-demo-inventory";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";
import { loadOperationsSnapshot } from "@/lib/staff/load-operations-snapshot";
import { requireStaffAccess } from "@/lib/staff/require-staff-access";
import { staffManagerAccessFromStaffAccess } from "@/lib/staff/require-staff-manager-access";
import { staffOwnerAccessFromStaffAccess } from "@/lib/staff/require-staff-owner-access";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import {
  STAFF_OPERATIONS_PATH,
  STAFF_RESERVATIONS_PATH,
} from "@/lib/staff/staff-routes";
import { createClient } from "@/lib/supabase/server";

export async function StaffOperationsPageContent() {
  await connection();
  const gate = await requireStaffAccess(STAFF_OPERATIONS_PATH);

  if (gate.status === "denied") {
    return (
      <SiteContainer className="py-space-2xl">
        <StaffContextBanner mode="denied" message={gate.message} />
      </SiteContainer>
    );
  }

  const staffAccess = await getStaffAccess();
  const managerGate = staffManagerAccessFromStaffAccess(staffAccess);
  const ownerGate = staffOwnerAccessFromStaffAccess(staffAccess);
  const canMutate = managerGate.ok;
  const canEditBusinessSettings = ownerGate.ok;

  const supabase = await createClient();
  const [snapshot, bookingReadiness] = await Promise.all([
    loadOperationsSnapshot(supabase),
    getPublicBookingReadiness(),
  ]);
  const readinessChecklist = buildOperationsReadinessChecklist(snapshot, bookingReadiness);
  const stagingDemo = isStagingDemoInventory(snapshot.tables);

  const bannerMessage = canMutate
    ? "Owner/manager access. Changes apply through database rules and may affect online booking readiness."
    : managerGate.error;

  return (
    <SiteContainer className="py-space-2xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          eyebrow="Staff · Langileak"
          title="Restaurant operations"
          description="Business timezone (owners), weekly hours, shifts, closures, and tables. Floor staff can view; managers and owners can edit where policy allows."
        />
        <div className="flex flex-wrap gap-space-sm">
          <Link
            href={STAFF_RESERVATIONS_PATH}
            className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary"
          >
            Reservations
          </Link>
          <form action={signOutStaff}>
            <button
              type="submit"
              className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {stagingDemo ? (
        <div className="mt-space-lg">
          <StaffContextBanner
            mode="staging"
            message="Seating and Lunch shifts use approved hackathon staging values (Table 1–8, 32 seats, max_covers 24). Not the real Caserío Goikola floor plan."
          />
        </div>
      ) : null}

      <div className={stagingDemo ? "mt-space-md" : "mt-space-lg"}>
        <StaffContextBanner
          mode={canMutate ? "live" : "denied"}
          message={
            canMutate
              ? bannerMessage
              : bannerMessage || "View-only operational data for your staff role."
          }
          role={gate.session.role}
          staffName={gate.session.displayName}
        />
      </div>

      <div className="mt-space-xl">
        <StaffOperationsDashboard
          snapshot={snapshot}
          canMutate={canMutate}
          canEditBusinessSettings={canEditBusinessSettings}
          readinessChecklist={readinessChecklist}
          bookingLive={bookingReadiness.live}
        />
      </div>
    </SiteContainer>
  );
}

export function StaffOperationsFallback() {
  return (
    <SiteContainer className="py-space-2xl">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Loading restaurant operations…
      </p>
    </SiteContainer>
  );
}
