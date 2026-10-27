import Link from "next/link";
import { connection } from "next/server";
import { ADMIN_CUSTOMERS_PATH } from "@/lib/admin/admin-routes";
import {
  loadAdminCustomerDetail,
  loadAdminCustomers,
} from "@/lib/admin/load-customers";
import { statusBadgeClass, statusLabels } from "@/lib/staff/reservation-status";
import { formatArrivalTime } from "@/lib/staff/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/cn";

export const instant = false;

type AdminCustomersPageProps = {
  searchParams: Promise<{ q?: string; guest?: string }>;
};

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  await connection();
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const selectedGuestId = params.guest?.trim() ?? "";

  const supabase = await createClient();
  const { rows, error } = await loadAdminCustomers(supabase, searchQuery);
  const detailResult = selectedGuestId
    ? await loadAdminCustomerDetail(supabase, selectedGuestId)
    : null;

  return (
    <div className="flex flex-col gap-space-xl">
      <header>
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Customers
        </h1>
        <p className="mt-space-xs text-[#424842]">
          Guest profiles derived from reservations. Contact details are visible to
          owners and managers only.
        </p>
      </header>

      <form
        method="get"
        action={ADMIN_CUSTOMERS_PATH}
        className="flex flex-col gap-space-md rounded-2xl border border-[#294632]/10 bg-white p-space-lg sm:flex-row sm:items-end"
      >
        <label className="flex min-w-0 flex-1 flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Search customers
          </span>
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Name, email, or phone"
            className="min-h-11 rounded-lg border border-[#294632]/20 px-3"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-[#294632] px-space-lg font-semibold text-[#F3EBDD]"
        >
          Search
        </button>
      </form>

      {error ? (
        <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
          {error}
        </p>
      ) : (
        <div className="flex flex-col gap-space-xl lg:flex-row lg:items-start">
          <section className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
            <table className="w-full min-w-[640px] text-left font-body-md text-body-md">
              <thead>
                <tr className="border-b border-outline-variant/40 text-[#424842]">
                  <th className="py-space-sm pr-space-md">Name</th>
                  <th className="py-space-sm pr-space-md">Email</th>
                  <th className="py-space-sm pr-space-md">Bookings</th>
                  <th className="py-space-sm pr-space-md">Completed</th>
                  <th className="py-space-sm">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-space-lg text-on-surface-variant">
                      No customers match this search.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const href = `${ADMIN_CUSTOMERS_PATH}?${new URLSearchParams({
                      ...(searchQuery ? { q: searchQuery } : {}),
                      guest: row.guestId,
                    }).toString()}`;
                    return (
                      <tr
                        key={row.guestId}
                        className={cn(
                          "border-b border-outline-variant/20",
                          selectedGuestId === row.guestId && "bg-surface-container-high",
                        )}
                      >
                        <td className="py-space-sm pr-space-md">
                          <Link href={href} className="font-semibold text-[#294632]">
                            {row.displayName}
                          </Link>
                        </td>
                        <td className="py-space-sm pr-space-md">{row.email || "—"}</td>
                        <td className="py-space-sm pr-space-md tabular-nums">
                          {row.reservationCount}
                        </td>
                        <td className="py-space-sm pr-space-md tabular-nums">
                          {row.completedVisits}
                        </td>
                        <td className="py-space-sm">{row.lastServiceDate ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>

          <aside className="w-full shrink-0 rounded-2xl border border-[#294632]/10 bg-white p-space-lg lg:max-w-md">
            <h2 className="font-headline-sm text-headline-sm text-[#294632]">
              Customer detail
            </h2>
            {!detailResult?.detail ? (
              <p className="mt-space-md text-on-surface-variant">
                Select a customer to view contact details and reservation history.
              </p>
            ) : detailResult.error ? (
              <p className="mt-space-md text-on-error-container">{detailResult.error}</p>
            ) : (
              <>
                <dl className="mt-space-md flex flex-col gap-space-sm font-body-md text-body-md">
                  <div>
                    <dt className="text-on-surface-variant">Name</dt>
                    <dd className="font-semibold">{detailResult.detail.displayName}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Email</dt>
                    <dd>{detailResult.detail.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Phone</dt>
                    <dd>{detailResult.detail.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Totals</dt>
                    <dd>
                      {detailResult.detail.reservationCount} bookings ·{" "}
                      {detailResult.detail.completedVisits} completed visits
                    </dd>
                  </div>
                </dl>
                <h3 className="mt-space-lg font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
                  Reservation history
                </h3>
                <ul className="mt-space-sm flex max-h-80 flex-col gap-space-sm overflow-y-auto">
                  {detailResult.detail.reservations.map((reservation) => (
                    <li
                      key={reservation.id}
                      className="rounded-lg border border-outline-variant/30 px-space-md py-space-sm"
                    >
                      <p className="font-semibold">
                        {reservation.serviceDate} ·{" "}
                        {formatArrivalTime(reservation.arrivalTime)}
                      </p>
                      <p className="text-label-sm text-[#424842]">
                        Party of {reservation.partySize}
                      </p>
                      <span
                        className={cn(
                          "mt-space-xs inline-flex rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold",
                          statusBadgeClass(reservation.status),
                        )}
                      >
                        {statusLabels[reservation.status]}
                      </span>
                      {reservation.notes ? (
                        <p className="mt-space-xs text-label-sm text-on-surface-variant">
                          {reservation.notes}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
