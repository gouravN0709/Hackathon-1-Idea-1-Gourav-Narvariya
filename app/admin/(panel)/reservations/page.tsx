import Link from "next/link";
import { connection } from "next/server";
import { runAdminReservationMutation } from "@/app/admin/(panel)/reservations/actions";
import { initialAdminReservationMutationState } from "@/app/admin/(panel)/reservations/mutation-state";
import { AdminCreateReservationForm } from "@/components/admin/admin-create-reservation-form";
import { StaffReservationsDashboard } from "@/components/staff/staff-reservations-dashboard";
import { ADMIN_RESERVATIONS_PATH } from "@/lib/admin/admin-routes";
import { loadAdminReservations } from "@/lib/admin/load-admin-reservations";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type AdminReservationsPageProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    q?: string;
    page?: string;
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

export default async function AdminReservationsPage({
  searchParams,
}: AdminReservationsPageProps) {
  await connection();
  const params = await searchParams;
  const serviceDate = params.date?.trim() || "";
  const status = parseStatus(params.status);
  const searchQuery = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();
  const loaded = await loadAdminReservations(supabase, {
    serviceDate: serviceDate || undefined,
    status,
    searchQuery: searchQuery || undefined,
    page,
  });

  const filterDate = serviceDate || defaultServiceDate();
  const totalPages = Math.max(
    1,
    Math.ceil(loaded.totalCount / loaded.pageSize),
  );

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (serviceDate) {
      query.set("date", serviceDate);
    }
    if (status !== "all") {
      query.set("status", status);
    }
    if (searchQuery) {
      query.set("q", searchQuery);
    }
    query.set("page", String(nextPage));
    return `${ADMIN_RESERVATIONS_PATH}?${query.toString()}`;
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Reservations
        </h1>
        <p className="mt-space-xs text-[#424842]">
          Search, filter, update status, and create bookings manually.
        </p>
      </header>

      <form
        method="get"
        action={ADMIN_RESERVATIONS_PATH}
        className="grid gap-space-md rounded-2xl border border-[#294632]/10 bg-white p-space-lg sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Service date
          </span>
          <input
            type="date"
            name="date"
            defaultValue={serviceDate}
            className="min-h-11 rounded-lg border border-[#294632]/20 px-3"
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Status
          </span>
          <select
            name="status"
            defaultValue={status}
            className="min-h-11 rounded-lg border border-[#294632]/20 px-3"
          >
            <option value="all">All</option>
            {reservationStatuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-space-xs sm:col-span-2">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Search
          </span>
          <input
            type="search"
            name="q"
            placeholder="Name, email, phone, or ITU- reference"
            defaultValue={searchQuery}
            className="min-h-11 rounded-lg border border-[#294632]/20 px-3"
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="min-h-10 rounded-lg bg-[#294632] px-space-lg font-semibold text-[#F3EBDD]"
          >
            Apply filters
          </button>
        </div>
      </form>

      {loaded.error ? (
        <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
          {loaded.error}
        </p>
      ) : (
        <>
          <StaffReservationsDashboard
            rows={loaded.rows}
            initialServiceDate={filterDate}
            initialStatus={status}
            initialReference={searchQuery}
            enableMutations
            clientSideFilter={false}
            showGuestContact
            referenceFieldLabel="Search (local)"
            reservationMutationAction={runAdminReservationMutation}
            reservationMutationInitialState={initialAdminReservationMutationState}
            emptyMessage="No reservations match these filters."
          />
          <nav
            className="flex flex-wrap items-center justify-between gap-space-md rounded-xl border border-[#294632]/10 bg-white px-space-md py-space-sm"
            aria-label="Pagination"
          >
            <p className="text-label-sm text-[#424842]">
              Page {loaded.page} of {totalPages} · {loaded.totalCount} total
            </p>
            <div className="flex gap-space-sm">
              {loaded.page > 1 ? (
                <Link href={pageHref(loaded.page - 1)} className="text-[#B77948] font-semibold">
                  Previous
                </Link>
              ) : null}
              {loaded.page < totalPages ? (
                <Link href={pageHref(loaded.page + 1)} className="text-[#B77948] font-semibold">
                  Next
                </Link>
              ) : null}
            </div>
          </nav>
        </>
      )}

      <AdminCreateReservationForm defaultDate={defaultServiceDate()} />
    </div>
  );
}
