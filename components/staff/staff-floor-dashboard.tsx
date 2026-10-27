"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  assignReservationToTables,
  initialStaffFloorMutationState,
  markGuestArrivedAtTables,
  runFloorReservationAndTableAction,
  updateTableOperationalStatus,
} from "@/app/staff/floor/actions";
import { FloorPlanCanvas } from "@/components/floor/floor-plan-canvas";
import { TABLE_STATUS_LABELS } from "@/lib/floor/table-status";
import type { FloorReservationRow, FloorServiceSnapshot } from "@/lib/floor/types";
import { cn } from "@/lib/cn";

type StaffFloorDashboardProps = {
  snapshot: FloorServiceSnapshot;
  serviceDate: string;
  shiftId: string | null;
  pollSeconds: number;
};

const fieldClass =
  "min-h-10 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-body-md text-body-md text-on-surface";

function MutationBanner({
  state,
}: {
  state: typeof initialStaffFloorMutationState;
}) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm text-on-error-container" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return (
      <p className="rounded-lg bg-primary-container/30 p-space-sm font-body-sm text-body-sm text-primary" role="status">
        {state.message}
      </p>
    );
  }
  return null;
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}

export function StaffFloorDashboard({
  snapshot,
  serviceDate,
  shiftId,
  pollSeconds,
}: StaffFloorDashboardProps) {
  const router = useRouter();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(
    snapshot.areas[0]?.id ?? null,
  );
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [assignTableIds, setAssignTableIds] = useState<string[]>([]);

  const [assignState, assignAction, assignPending] = useActionState(
    assignReservationToTables,
    initialStaffFloorMutationState,
  );
  const [tableState, tableAction, tablePending] = useActionState(
    updateTableOperationalStatus,
    initialStaffFloorMutationState,
  );
  const [reservationState, reservationAction, reservationPending] = useActionState(
    runFloorReservationAndTableAction,
    initialStaffFloorMutationState,
  );
  const [arrivedState, arrivedAction, arrivedPending] = useActionState(
    markGuestArrivedAtTables,
    initialStaffFloorMutationState,
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, pollSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [router, pollSeconds]);

  const selectedArea =
    snapshot.areas.find((area) => area.id === selectedAreaId) ?? snapshot.areas[0] ?? null;

  const stateByTable = useMemo(() => {
    return new Map(snapshot.states.map((state) => [state.table_id, state]));
  }, [snapshot.states]);

  const assignedTableIds = useMemo(() => {
    const set = new Set<string>();
    for (const reservation of snapshot.reservations) {
      for (const tableId of reservation.tableIds) {
        set.add(tableId);
      }
    }
    return set;
  }, [snapshot.reservations]);

  const selectedReservation: FloorReservationRow | null =
    snapshot.reservations.find((row) => row.id === selectedReservationId) ?? null;

  const upcoming = snapshot.reservations.filter(
    (row) => row.status === "pending" || row.status === "confirmed",
  );

  const bannerState =
    [assignState, tableState, reservationState, arrivedState].find(
      (state) => state.error || (state.success && state.message),
    ) ?? initialStaffFloorMutationState;

  const toggleAssignTable = (tableId: string) => {
    setAssignTableIds((current) =>
      current.includes(tableId)
        ? current.filter((id) => id !== tableId)
        : [...current, tableId],
    );
  };

  if (!snapshot.schemaReady) {
    return (
      <div className="rounded-xl border border-[#B77948]/40 bg-[#FFF8EF] p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-primary">Floor operations migration pending</h2>
        <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
          Apply the Phase 2 floor migration to use live table statuses and areas. Reservations and
          assignments still work from the reservations screen.
        </p>
      </div>
    );
  }

  if (!shiftId) {
    return (
      <p className="rounded-lg bg-surface-variant/30 p-space-md font-body-md text-body-md text-on-surface-variant">
        No active shift for this date. Choose another date or configure shifts in Operations.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <MutationBanner state={bannerState} />

      <div className="grid gap-space-lg xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,420px)]">
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-end gap-space-md">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Area
              <select
                className={cn(fieldClass, "mt-1 block min-w-[10rem]")}
                value={selectedArea?.id ?? ""}
                onChange={(event) => setSelectedAreaId(event.target.value || null)}
              >
                {snapshot.areas.length === 0 ? (
                  <option value="">Main floor</option>
                ) : (
                  snapshot.areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Refreshes every {pollSeconds}s · select a table or reservation for actions
            </p>
          </div>

          <FloorPlanCanvas
            mode="view"
            area={selectedArea}
            tables={snapshot.tables}
            states={snapshot.states}
            assignedTableIds={assignedTableIds}
            selectedTableId={selectedTableId}
            onSelectTable={(tableId) => {
              setSelectedTableId(tableId);
              const reservation = snapshot.reservations.find((row) =>
                row.tableIds.includes(tableId),
              );
              if (reservation) {
                setSelectedReservationId(reservation.id);
              }
            }}
          />

          {selectedTableId && shiftId ? (
            <form action={tableAction} className="flex flex-wrap items-end gap-space-sm rounded-xl border border-outline-variant/25 bg-white p-space-md">
              <input type="hidden" name="tableId" value={selectedTableId} />
              <input type="hidden" name="serviceDate" value={serviceDate} />
              <input type="hidden" name="shiftId" value={shiftId} />
              <input
                type="hidden"
                name="stateUpdatedAt"
                value={stateByTable.get(selectedTableId)?.updated_at ?? ""}
              />
              <label className="font-label-sm text-label-sm text-on-surface-variant">
                Table status
                <select name="operationalStatus" className={cn(fieldClass, "mt-1 block")} defaultValue="available">
                  {Object.entries(TABLE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={tablePending}
                className="min-h-10 rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
              >
                Update table
              </button>
            </form>
          ) : null}
        </section>

        <aside className="flex flex-col gap-space-lg">
          <section className="rounded-xl border border-outline-variant/25 bg-white p-space-md">
            <h2 className="font-headline-sm text-headline-sm text-primary">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
                No pending or confirmed reservations for this service.
              </p>
            ) : (
              <ul className="mt-space-sm flex max-h-64 flex-col gap-space-xs overflow-y-auto">
                {upcoming.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReservationId(row.id);
                        setAssignTableIds(row.tableIds);
                      }}
                      className={cn(
                        "w-full rounded-lg px-space-sm py-space-sm text-left",
                        selectedReservationId === row.id
                          ? "bg-primary-container/40"
                          : "hover:bg-surface-variant/20",
                      )}
                    >
                      <p className="font-body-md text-body-md font-semibold text-on-surface">
                        {formatTime(row.arrivalTime)} · {row.guestDisplayName}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {row.partySize} guests · {row.status}
                        {row.tableLabels.length ? ` · ${row.tableLabels.join(", ")}` : " · Unassigned"}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selectedReservation ? (
            <section className="rounded-xl border border-outline-variant/25 bg-white p-space-md">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                {selectedReservation.reference}
              </h2>
              <p className="mt-space-xs font-body-md text-body-md text-on-surface">
                {selectedReservation.guestDisplayName} · {selectedReservation.partySize} guests
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Arrival {formatTime(selectedReservation.arrivalTime)} · {selectedReservation.status}
              </p>

              <div className="mt-space-md">
                <p className="font-label-sm text-label-sm text-on-surface-variant">Assign tables</p>
                <ul className="mt-space-xs flex max-h-40 flex-col gap-space-xs overflow-y-auto">
                  {snapshot.tables
                    .filter((table) => table.is_active)
                    .map((table) => (
                      <li key={table.id}>
                        <label className="flex cursor-pointer items-center gap-space-sm font-body-sm text-body-sm">
                          <input
                            type="checkbox"
                            checked={assignTableIds.includes(table.id)}
                            onChange={() => toggleAssignTable(table.id)}
                          />
                          {table.label} ({table.seat_count} seats)
                        </label>
                      </li>
                    ))}
                </ul>
                <form action={assignAction} className="mt-space-sm">
                  <input type="hidden" name="reservationId" value={selectedReservation.id} />
                  <input type="hidden" name="tableIds" value={assignTableIds.join(",")} />
                  <button
                    type="submit"
                    disabled={assignPending || assignTableIds.length === 0}
                    className="min-h-10 w-full rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary disabled:opacity-50"
                  >
                    Save assignment
                  </button>
                </form>
              </div>

              <div className="mt-space-md flex flex-col gap-space-sm border-t border-outline-variant/20 pt-space-md">
                <form action={arrivedAction}>
                  <input type="hidden" name="serviceDate" value={serviceDate} />
                  <input type="hidden" name="shiftId" value={shiftId} />
                  <input
                    type="hidden"
                    name="tableIds"
                    value={(selectedReservation.tableIds.length
                      ? selectedReservation.tableIds
                      : assignTableIds
                    ).join(",")}
                  />
                  <button
                    type="submit"
                    disabled={arrivedPending}
                    className="min-h-10 w-full rounded-lg border border-primary px-space-md text-primary"
                  >
                    Mark arrived (tables)
                  </button>
                </form>

                {selectedReservation.status === "confirmed" ? (
                  <form action={reservationAction}>
                    <input type="hidden" name="reservationId" value={selectedReservation.id} />
                    <input type="hidden" name="reservationAction" value="mark_seated" />
                    <input type="hidden" name="updatedAt" value={selectedReservation.updatedAt} />
                    <input type="hidden" name="serviceDate" value={serviceDate} />
                    <input type="hidden" name="shiftId" value={shiftId} />
                    <input
                      type="hidden"
                      name="tableIds"
                      value={selectedReservation.tableIds.join(",")}
                    />
                    <button
                      type="submit"
                      disabled={reservationPending}
                      className="min-h-10 w-full rounded-lg bg-[#8B3A3A] px-space-md font-body-md text-body-md font-semibold text-white"
                    >
                      Mark seated
                    </button>
                  </form>
                ) : null}

                {selectedReservation.status === "seated" ? (
                  <form action={reservationAction}>
                    <input type="hidden" name="reservationId" value={selectedReservation.id} />
                    <input type="hidden" name="reservationAction" value="mark_completed" />
                    <input type="hidden" name="updatedAt" value={selectedReservation.updatedAt} />
                    <input type="hidden" name="serviceDate" value={serviceDate} />
                    <input type="hidden" name="shiftId" value={shiftId} />
                    <input
                      type="hidden"
                      name="tableIds"
                      value={selectedReservation.tableIds.join(",")}
                    />
                    <button
                      type="submit"
                      disabled={reservationPending}
                      className="min-h-10 w-full rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
                    >
                      Complete · start cleaning
                    </button>
                  </form>
                ) : null}
              </div>
            </section>
          ) : (
            <p className="rounded-xl border border-dashed border-outline-variant/40 p-space-md font-body-md text-body-md text-on-surface-variant">
              Select a reservation to assign tables or update arrival status.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
