import Link from "next/link";
import { connection } from "next/server";
import { loadAdminDashboardStats } from "@/lib/admin/load-dashboard-stats";
import {
  ADMIN_OPERATIONS_PATH,
  ADMIN_RESERVATIONS_PATH,
} from "@/lib/admin/admin-routes";
import { statusBadgeClass, statusLabels } from "@/lib/staff/reservation-status";
import { formatArrivalTime } from "@/lib/staff/format";
import { reservationStatuses } from "@/lib/staff/types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();
  const supabase = await createClient();
  const stats = await loadAdminDashboardStats(supabase);

  if (stats.error) {
    return (
      <div className="rounded-2xl border border-error/30 bg-error-container/30 p-space-lg">
        <p className="text-on-error-container">{stats.error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Dashboard
        </h1>
        <p className="mt-space-xs font-body-md text-body-md text-[#424842]">
          Service date {stats.serviceDate} (Europe/Madrid). Live data from Supabase.
        </p>
      </header>

      <section className="grid gap-space-md sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href={`${ADMIN_RESERVATIONS_PATH}?date=${stats.serviceDate}`}
          className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-label-sm text-label-sm uppercase tracking-wide text-[#424842]">
            Reservations today
          </p>
          <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
            {stats.reservationsToday}
          </p>
        </Link>
        <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg shadow-sm">
          <p className="font-label-sm text-label-sm uppercase tracking-wide text-[#424842]">
            Guests expected today
          </p>
          <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
            {stats.guestsExpectedToday}
          </p>
        </div>
        <Link
          href={ADMIN_RESERVATIONS_PATH}
          className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="font-label-sm text-label-sm uppercase tracking-wide text-[#424842]">
            Upcoming reservations
          </p>
          <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
            {stats.upcomingCount}
          </p>
          <p className="mt-space-xs text-label-sm text-[#424842]">
            {stats.upcomingGuests} guests on future dates
          </p>
        </Link>
        <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg shadow-sm">
          <p className="font-label-sm text-label-sm uppercase tracking-wide text-[#424842]">
            Cover capacity today
          </p>
          {stats.capacityToday ? (
            <>
              <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
                {stats.capacityToday.reservedCovers} / {stats.capacityToday.maxCovers}
              </p>
              <p className="mt-space-xs text-label-sm text-[#424842]">
                Reserved covers across shifts
              </p>
            </>
          ) : (
            <p className="mt-space-sm text-on-surface-variant">
              No capacity rows for today yet.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-space-xl lg:grid-cols-2">
        <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
          <h2 className="font-headline-sm text-headline-sm text-[#294632]">
            Status overview
          </h2>
          <ul className="mt-space-md flex flex-col gap-space-sm">
            {reservationStatuses.map((status) => (
              <li key={status} className="flex items-center justify-between gap-space-md">
                <Link
                  href={`${ADMIN_RESERVATIONS_PATH}?status=${status}`}
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold",
                    statusBadgeClass(status),
                  )}
                >
                  {statusLabels[status]}
                </Link>
                <span className="font-semibold tabular-nums">{stats.countsByStatus[status]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
          <h2 className="font-headline-sm text-headline-sm text-[#294632]">
            Operational alerts
          </h2>
          {stats.alerts.length === 0 ? (
            <p className="mt-space-md text-on-surface-variant">No alerts right now.</p>
          ) : (
            <ul className="mt-space-md list-disc space-y-space-sm pl-space-lg text-[#292B25]">
              {stats.alerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          )}
          <Link
            href={ADMIN_OPERATIONS_PATH}
            className="mt-space-lg inline-flex min-h-10 items-center rounded-lg bg-[#B77948] px-space-md font-body-md text-body-md font-semibold text-white"
          >
            Daily operations
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
        <div className="flex items-center justify-between gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-[#294632]">
            Recent reservations
          </h2>
          <Link href={ADMIN_RESERVATIONS_PATH} className="text-[#B77948] font-semibold">
            View all
          </Link>
        </div>
        <div className="mt-space-md overflow-x-auto">
          <table className="w-full min-w-[560px] text-left font-body-md text-body-md">
            <thead>
              <tr className="border-b border-outline-variant/40 text-[#424842]">
                <th className="py-space-sm pr-space-md">Guest</th>
                <th className="py-space-sm pr-space-md">Date</th>
                <th className="py-space-sm pr-space-md">Time</th>
                <th className="py-space-sm pr-space-md">Party</th>
                <th className="py-space-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-space-lg text-on-surface-variant">
                    No reservations loaded.
                  </td>
                </tr>
              ) : (
                stats.recentReservations.map((row) => (
                  <tr key={row.id} className="border-b border-outline-variant/20">
                    <td className="py-space-sm pr-space-md">{row.guestDisplayName}</td>
                    <td className="py-space-sm pr-space-md">{row.serviceDate}</td>
                    <td className="py-space-sm pr-space-md">
                      {formatArrivalTime(row.arrivalTime)}
                    </td>
                    <td className="py-space-sm pr-space-md">{row.partySize}</td>
                    <td className="py-space-sm">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold",
                          statusBadgeClass(row.status),
                        )}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
