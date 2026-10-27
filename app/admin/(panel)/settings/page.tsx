import { connection } from "next/server";
import { StaffOperationsDashboard } from "@/components/staff/staff-operations-dashboard";
import { contact, siteConfig } from "@/lib/site-config";
import { buildOperationsReadinessChecklist } from "@/lib/booking/operations-readiness-checklist";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { staffOwnerAccessFromStaffAccess } from "@/lib/staff/require-staff-owner-access";
import { loadOperationsSnapshot } from "@/lib/staff/load-operations-snapshot";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminSettingsPage() {
  await connection();
  const staffAccess = await getStaffAccess();
  const ownerGate = staffOwnerAccessFromStaffAccess(staffAccess);

  const supabase = await createClient();
  const [snapshot, bookingReadiness] = await Promise.all([
    loadOperationsSnapshot(supabase),
    getPublicBookingReadiness(),
  ]);
  const readinessChecklist = buildOperationsReadinessChecklist(
    snapshot,
    bookingReadiness,
  );

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Business settings
        </h1>
        <p className="mt-space-xs max-w-3xl text-[#424842]">
          Database-backed timezone and operational configuration. Public marketing
          copy and contact details remain in site configuration until synced
          manually.
        </p>
      </header>

      <section className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-[#294632]">
          Published site defaults (read-only)
        </h2>
        <dl className="mt-space-md grid gap-space-sm sm:grid-cols-2 font-body-md text-body-md">
          <div>
            <dt className="text-on-surface-variant">Legal name</dt>
            <dd>{siteConfig.legalName}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Public email</dt>
            <dd>{contact.email}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Telephone</dt>
            <dd>{contact.phoneDisplay}</dd>
          </div>
          <div>
            <dt className="text-on-surface-variant">Address</dt>
            <dd>{contact.addressLines.join(", ")}</dd>
          </div>
        </dl>
        <p className="mt-space-md text-label-sm text-on-surface-variant">
          Edit <code className="text-xs">lib/site-config.ts</code> to change guest-facing
          marketing copy. Operational booking rules are controlled below.
        </p>
      </section>

      <StaffOperationsDashboard
        snapshot={snapshot}
        canMutate
        canEditBusinessSettings={ownerGate.ok}
        readinessChecklist={readinessChecklist}
        bookingLive={bookingReadiness.live}
      />
    </div>
  );
}
