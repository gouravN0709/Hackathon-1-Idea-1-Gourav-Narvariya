import { connection } from "next/server";
import { StaffOperationsDashboard } from "@/components/staff/staff-operations-dashboard";
import { buildOperationsReadinessChecklist } from "@/lib/booking/operations-readiness-checklist";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";
import { loadOperationsSnapshot } from "@/lib/staff/load-operations-snapshot";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminAvailabilityPage() {
  await connection();
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
          Availability & capacity
        </h1>
        <p className="mt-space-xs max-w-3xl text-[#424842]">
          Weekly hours, bookable shifts, closures, and tables feed the public
          booking API. Changes here affect live availability when booking readiness
          checks pass.
        </p>
      </header>

      <StaffOperationsDashboard
        snapshot={snapshot}
        canMutate
        canEditBusinessSettings={false}
        readinessChecklist={readinessChecklist}
        bookingLive={bookingReadiness.live}
      />
    </div>
  );
}
