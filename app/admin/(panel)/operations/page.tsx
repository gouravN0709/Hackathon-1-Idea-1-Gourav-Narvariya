import Link from "next/link";
import { connection } from "next/server";
import { ADMIN_RESERVATIONS_PATH } from "@/lib/admin/admin-routes";
import { loadAdminDailyOperations } from "@/lib/admin/load-daily-operations";
import { statusBadgeClass, statusLabels } from "@/lib/staff/reservation-status";
import { formatArrivalTime } from "@/lib/staff/format";
import { reservationStatuses } from "@/lib/staff/types";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const instant = false;

type AdminOperationsPageProps = {
  searchParams: Promise<{ date?: string }>;
};

function defaultServiceDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function AdminOperationsPage({
  searchParams,
}: AdminOperationsPageProps) {
  await connection();
  const params = await searchParams;
  const serviceDate = params.date?.trim() || defaultServiceDate();

  const supabase = await createClient();
  const daily = await loadAdminDailyOperations(supabase, serviceDate);

  return (
    <div className="flex flex-col gap-space-xl">
      <header className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
            Daily operations
          </h1>
          <p className="mt-space-xs text-[#424842]">
            Service overview by arrival time. Floor staff use the staff panel for
            live status updates.
          </p>
        </div>
        <form method="get" className="flex items-end gap-space-sm">
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
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-[#294632] px-space-md font-semibold text-[#F3EBDD]"
          >
            View
          </button>
        </form>
      </header>

      {daily.error ? (
        <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
          {daily.error}
        </p>
      ) : (
        <>
          <section className="grid gap-space-md sm:grid-cols-3">
            <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
              <p className="text-label-sm uppercase text-[#424842]">Reservations</p>
              <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
                {daily.totalReservations}
              </p>
            </div>
            <div className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
              <p className="text-label-sm uppercase text-[#424842]">Expected guests</p>
              <p className="mt-space-sm font-headline-lg text-headline-lg-mobile text-[#294632]">
                {daily.totalGuests}
              </p>
            </div>
            <Link
              href={`${ADMIN_RESERVATIONS_PATH}?date=${serviceDate}`}
              className="flex flex-col justify-center rounded-2xl border border-[#B77948]/30 bg-[#B77948]/10 p-space-lg font-semibold text-[#875124]"
            >
              Open reservation list for this date
            </Link>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
            <table className="w-full min-w-[720px] text-left font-body-md text-body-md">
              <thead>
                <tr className="border-b border-outline-variant/40 text-[#424842]">
                  <th className="py-space-sm pr-space-md">Arrival</th>
                  <th className="py-space-sm pr-space-md">Shift</th>
                  <th className="py-space-sm pr-space-md">Reservations</th>
                  <th className="py-space-sm pr-space-md">Guests</th>
                  {reservationStatuses.map((status) => (
                    <th key={status} className="py-space-sm pr-space-md">
                      {statusLabels[status]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daily.slots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + reservationStatuses.length}
                      className="py-space-lg text-on-surface-variant"
                    >
                      No reservations on this date.
                    </td>
                  </tr>
                ) : (
                  daily.slots.map((slot) => (
                    <tr
                      key={`${slot.arrivalTime}-${slot.shiftName}`}
                      className="border-b border-outline-variant/20"
                    >
                      <td className="py-space-sm pr-space-md">
                        {formatArrivalTime(slot.arrivalTime)}
                      </td>
                      <td className="py-space-sm pr-space-md">
                        {slot.shiftName ?? "—"}
                      </td>
                      <td className="py-space-sm pr-space-md tabular-nums">
                        {slot.reservations}
                      </td>
                      <td className="py-space-sm pr-space-md tabular-nums">
                        {slot.guests}
                      </td>
                      {reservationStatuses.map((status) => (
                        <td key={status} className="py-space-sm pr-space-md tabular-nums">
                          {slot.byStatus[status] > 0 ? (
                            <span
                              className={cn(
                                "inline-flex min-w-6 justify-center rounded-full px-1.5 font-label-sm text-label-sm font-semibold",
                                statusBadgeClass(status),
                              )}
                            >
                              {slot.byStatus[status]}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
