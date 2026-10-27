import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { StaffContextBanner } from "@/components/staff/staff-context-banner";
import { StaffReservationsDashboard } from "@/components/staff/staff-reservations-dashboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteContainer } from "@/components/ui/site-container";
import { sampleStaffReservations } from "@/lib/staff/sample-reservations";
import { isStaffDemoReservationsEnabled } from "@/lib/staff/staff-routes";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

type StaffDemoReservationsPageContentProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    reference?: string;
  }>;
};

function defaultServiceDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parseStatus(value: string | undefined): ReservationStatus | "all" {
  if (!value || value === "all") {
    return "all";
  }
  return (reservationStatuses as readonly string[]).includes(value)
    ? (value as ReservationStatus)
    : "all";
}

export async function StaffDemoReservationsPageContent({
  searchParams,
}: StaffDemoReservationsPageContentProps) {
  await connection();

  if (!isStaffDemoReservationsEnabled()) {
    notFound();
  }

  const params = await searchParams;
  const initialServiceDate = params.date?.trim() || defaultServiceDate();
  const initialStatus = parseStatus(params.status);
  const initialReference = params.reference?.trim() ?? "";

  return (
    <SiteContainer className="py-space-2xl">
      <SectionHeading
        eyebrow="Staff demo"
        title="Sample reservations"
        description="Local development only. Set STAFF_DEMO_RESERVATIONS=true in .env.local to enable this page."
      />
      <div className="mt-space-lg">
        <StaffContextBanner
          mode="demo"
          message="Fictional guests and references. Use /staff/login for the protected dashboard."
        />
      </div>
      <p className="mt-space-md font-body-md text-body-md text-on-surface-variant">
        <Link href="/staff/login" className="text-primary underline-offset-2 hover:underline">
          <TxServer>Staff sign in</TxServer>
        </Link>{" "}
        for live data.
      </p>
      <div className="mt-space-xl">
        <StaffReservationsDashboard
          rows={sampleStaffReservations}
          initialServiceDate={initialServiceDate}
          initialStatus={initialStatus}
          initialReference={initialReference}
          enableMutations={false}
          emptyMessage="No sample reservations match these filters."
          guestLabel="Guest (sample)"
        />
      </div>
    </SiteContainer>
  );
}
