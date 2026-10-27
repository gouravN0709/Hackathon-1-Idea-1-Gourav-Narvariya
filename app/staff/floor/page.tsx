import Link from "next/link";
import { connection } from "next/server";
import { signOutStaff } from "@/app/staff/login/actions";
import { StaffContextBanner } from "@/components/staff/staff-context-banner";
import { StaffFloorDashboard } from "@/components/staff/staff-floor-dashboard";
import { SectionHeading } from "@/components/ui/section-heading";
import { SiteContainer } from "@/components/ui/site-container";
import { loadFloorServiceSnapshot } from "@/lib/floor/load-floor-snapshot";
import {
  defaultServiceDateMadrid,
  loadActiveShiftsForServiceDate,
} from "@/lib/floor/shifts-for-date";
import { requireStaffAccess } from "@/lib/staff/require-staff-access";
import {
  staffPathFromRequest,
  STAFF_FLOOR_PATH,
  STAFF_OPERATIONS_PATH,
  STAFF_RESERVATIONS_PATH,
} from "@/lib/staff/staff-routes";
import { createClient } from "@/lib/supabase/server";

type StaffFloorPageProps = {
  searchParams: Promise<{
    date?: string;
    shift?: string;
  }>;
};

const POLL_SECONDS = 15;

function buildIntendedPath(params: { date?: string; shift?: string }): string {
  const query = new URLSearchParams();
  if (params.date?.trim()) {
    query.set("date", params.date.trim());
  }
  if (params.shift?.trim()) {
    query.set("shift", params.shift.trim());
  }
  const search = query.toString();
  return staffPathFromRequest(STAFF_FLOOR_PATH, search ? `?${search}` : "");
}

export default async function StaffFloorPage({ searchParams }: StaffFloorPageProps) {
  await connection();
  const params = await searchParams;
  const intendedPath = buildIntendedPath(params);
  const gate = await requireStaffAccess(intendedPath);

  if (gate.status === "denied") {
    return (
      <SiteContainer className="py-space-2xl">
        <p className="rounded-lg bg-error-container p-space-md text-on-error-container">{gate.message}</p>
      </SiteContainer>
    );
  }

  const serviceDate = params.date?.trim() || defaultServiceDateMadrid();
  const supabase = await createClient();
  const shiftsForDay = await loadActiveShiftsForServiceDate(supabase, serviceDate);
  const shiftId =
    params.shift?.trim() && shiftsForDay.some((shift) => shift.id === params.shift?.trim())
      ? params.shift.trim()
      : shiftsForDay[0]?.id ?? null;

  const snapshot = await loadFloorServiceSnapshot(supabase, {
    serviceDate,
    shiftId,
  });

  return (
    <SiteContainer className="flex flex-col gap-space-xl py-space-xl">
      <StaffContextBanner
        mode="live"
        message="Live floor plan and table statuses for the selected service."
        role={gate.session.role}
        staffName={gate.session.displayName}
      />

      <header className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Staff · Floor"
          title="Live floor operations"
          description="Today's service, table statuses, and seating actions. Updates refresh automatically."
        />
        <nav className="flex flex-wrap gap-space-sm font-body-md text-body-md">
          <Link href={STAFF_RESERVATIONS_PATH} className="text-primary underline-offset-2 hover:underline">
            Reservations
          </Link>
          <Link href={STAFF_OPERATIONS_PATH} className="text-primary underline-offset-2 hover:underline">
            Operations
          </Link>
          <form action={signOutStaff}>
            <button type="submit" className="text-on-surface-variant underline-offset-2 hover:underline">
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-space-md rounded-xl border border-outline-variant/25 bg-white p-space-md">
        <label className="font-label-sm text-label-sm text-on-surface-variant">
          Service date
          <input
            type="date"
            name="date"
            defaultValue={serviceDate}
            className="mt-1 block min-h-10 rounded-lg border border-outline-variant/40 px-3"
          />
        </label>
        <label className="font-label-sm text-label-sm text-on-surface-variant">
          Shift
          <select
            name="shift"
            defaultValue={shiftId ?? ""}
            className="mt-1 block min-h-10 min-w-[10rem] rounded-lg border border-outline-variant/40 px-3"
          >
            {shiftsForDay.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.starts_at.slice(0, 5)}–{shift.ends_at.slice(0, 5)})
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
        >
          Load service
        </button>
      </form>

      {snapshot.error ? (
        <p className="rounded-lg bg-error-container p-space-md font-body-md text-body-md text-on-error-container" role="alert">
          Could not load floor data.
        </p>
      ) : null}

      <StaffFloorDashboard
        snapshot={snapshot}
        serviceDate={serviceDate}
        shiftId={shiftId}
        pollSeconds={POLL_SECONDS}
      />
    </SiteContainer>
  );
}
