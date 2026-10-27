import { connection } from "next/server";
import { signOutStaff } from "@/app/staff/login/actions";
import { StaffContextBanner } from "@/components/staff/staff-context-banner";
import { StaffReservationsDashboard } from "@/components/staff/staff-reservations-dashboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteContainer } from "@/components/ui/site-container";
import { loadStaffReservations } from "@/lib/staff/load-reservations";
import { requireStaffAccess } from "@/lib/staff/require-staff-access";
import { resolveStaffReservationViewState } from "@/lib/staff/reservation-view-state";
import {
  staffPathFromRequest,
  STAFF_OPERATIONS_PATH,
  STAFF_RESERVATIONS_PATH,
} from "@/lib/staff/staff-routes";
import Link from "next/link";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";
import { createClient } from "@/lib/supabase/server";

type StaffReservationsPageContentProps = {
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

function buildIntendedPath(params: {
  date?: string;
  status?: string;
  reference?: string;
}): string {
  const query = new URLSearchParams();
  if (params.date?.trim()) {
    query.set("date", params.date.trim());
  }
  if (params.status?.trim() && params.status !== "all") {
    query.set("status", params.status.trim());
  }
  if (params.reference?.trim()) {
    query.set("reference", params.reference.trim());
  }
  const search = query.toString();
  return staffPathFromRequest(
    STAFF_RESERVATIONS_PATH,
    search ? `?${search}` : "",
  );
}

export async function StaffReservationsPageContent({
  searchParams,
}: StaffReservationsPageContentProps) {
  await connection();
  const params = await searchParams;
  const intendedPath = buildIntendedPath(params);
  const gate = await requireStaffAccess(intendedPath);
  const initialServiceDate = params.date?.trim() || defaultServiceDate();
  const initialStatus = parseStatus(params.status);
  const initialReference = params.reference?.trim() ?? "";

  if (gate.status === "denied") {
    return (
      <SiteContainer className="py-space-2xl">
        <StaffContextBanner mode="denied" message={gate.message} />
        <form action={signOutStaff} className="mt-space-lg">
          <button
            type="submit"
            className="rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary"
          >
            Sign out
          </button>
        </form>
      </SiteContainer>
    );
  }

  const supabase = await createClient();
  const loaded = await loadStaffReservations(supabase, {
    status: initialStatus,
    referenceQuery: initialReference,
  });
  const view = resolveStaffReservationViewState(gate.session, loaded);

  const bannerMessage = view.error
    ? view.error
    : "Live reservation data. Status and note changes save to the database for your staff role.";

  return (
    <SiteContainer className="py-space-2xl">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading
          eyebrow="Staff · Langileak"
          title="Reservations"
          description="Filter by service date, status, and reference."
        />
        <div className="flex flex-wrap gap-space-sm">
          {gate.session.role !== "staff" ? (
            <Link
              href={STAFF_OPERATIONS_PATH}
              className="rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary"
            >
              Operations
            </Link>
          ) : null}
          <form action={signOutStaff}>
            <button
              type="submit"
              className="rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-space-lg">
        <StaffContextBanner
          mode={view.error ? "denied" : "live"}
          message={bannerMessage}
          role={gate.session.role}
          staffName={gate.session.displayName}
        />
      </div>

      <div className="mt-space-xl">
        <StaffReservationsDashboard
          rows={view.rows}
          initialServiceDate={initialServiceDate}
          initialStatus={initialStatus}
          initialReference={initialReference}
          enableMutations={!view.error}
          emptyMessage={
            view.error
              ? "Reservation data could not be loaded."
              : "No reservations match these filters."
          }
        />
      </div>
    </SiteContainer>
  );
}
