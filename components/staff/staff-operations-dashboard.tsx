"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState, useState } from "react";
import {
  createRestaurantTable,
  createSpecialClosure,
  deleteSpecialClosure,
  initialStaffOperationsMutationState,
  updateRestaurantTableActive,
  updateServiceShift,
} from "@/app/staff/operations/actions";
import type {
  OperationsSnapshot,
  ServiceShiftRow,
} from "@/lib/staff/load-operations-snapshot";
import { StaffBookingReadinessSection } from "@/components/staff/staff-booking-readiness-section";
import { StaffBusinessSettingsSection } from "@/components/staff/staff-business-settings-section";
import { StaffWeeklyHoursSection } from "@/components/staff/staff-weekly-hours-section";
import type { ReadinessCheckItem } from "@/lib/booking/operations-readiness-checklist";
import { cn } from "@/lib/cn";

const ISO_WEEKDAY = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function MutationBanner({ state }: { state: typeof initialStaffOperationsMutationState }) {
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

function mergeMutationStates(
  ...states: (typeof initialStaffOperationsMutationState)[]
): typeof initialStaffOperationsMutationState {
  const errorState = states.find((s) => s.error);
  if (errorState) {
    return errorState;
  }
  const successState = states.find((s) => s.success && s.message);
  if (successState) {
    return successState;
  }
  return initialStaffOperationsMutationState;
}

const fieldClass =
  "w-full min-h-11 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-body-md text-body-md text-on-surface";

type StaffOperationsDashboardProps = {
  snapshot: OperationsSnapshot;
  canMutate: boolean;
  canEditBusinessSettings: boolean;
  readinessChecklist: ReadinessCheckItem[];
  bookingLive: boolean;
};

export function StaffOperationsDashboard({
  snapshot,
  canMutate,
  canEditBusinessSettings,
  readinessChecklist,
  bookingLive,
}: StaffOperationsDashboardProps) {
  const totalActiveSeats = snapshot.tables
    .filter((row) => row.is_active)
    .reduce((sum, row) => sum + row.seat_count, 0);
  const [closureState, closureAction, closurePending] = useActionState(
    createSpecialClosure,
    initialStaffOperationsMutationState,
  );
  const [deleteClosureState, deleteClosureAction, deleteClosurePending] = useActionState(
    deleteSpecialClosure,
    initialStaffOperationsMutationState,
  );
  const [shiftState, shiftAction, shiftPending] = useActionState(
    updateServiceShift,
    initialStaffOperationsMutationState,
  );
  const [tableState, tableAction, tablePending] = useActionState(
    createRestaurantTable,
    initialStaffOperationsMutationState,
  );
  const [tableToggleState, tableToggleAction, tableTogglePending] = useActionState(
    updateRestaurantTableActive,
    initialStaffOperationsMutationState,
  );

  const closureFormKey = closureState.success
    ? `ok-${closureState.message}`
    : closureState.error
      ? `err-${closureState.fields?.startsOn ?? "x"}`
      : "new";
  const tableFormKey = tableState.success
    ? `ok-${tableState.message}`
    : tableState.error
      ? `err-${tableState.fields?.label ?? "x"}`
      : "new";

  const closureBanner = mergeMutationStates(closureState, deleteClosureState);
  const tableBanner = mergeMutationStates(tableState, tableToggleState);

  return (
    <div className="flex flex-col gap-space-2xl">
      {snapshot.error ? (
        <p className="rounded-lg bg-error-container p-space-md font-body-md text-body-md text-on-error-container" role="alert">
          Could not load operational data: {snapshot.error}
        </p>
      ) : null}

      <StaffBookingReadinessSection items={readinessChecklist} bookingLive={bookingLive} />

      <StaffBusinessSettingsSection
        businessSettings={snapshot.businessSettings}
        canEdit={canEditBusinessSettings}
      />

      <StaffWeeklyHoursSection
        weeklyHours={snapshot.weeklyHours}
        shifts={snapshot.shifts}
        canMutate={canMutate}
      />

      <section className="flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary"><Tx>Service shifts</Tx></h2>
        <MutationBanner state={shiftState} />
        <div className="flex flex-col gap-space-md">
          {snapshot.shifts.map((shift) => (
            <ShiftRow
              key={shift.id}
              shift={shift}
              canMutate={canMutate}
              formAction={shiftAction}
              pending={shiftPending}
              totalActiveSeats={totalActiveSeats}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary"><Tx>Special closures</Tx></h2>
        <MutationBanner state={closureBanner} />
        <ul className="flex flex-col gap-space-sm">
          {snapshot.closures.map((closure) => (
            <li
              key={closure.id}
              className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="font-body-sm text-body-sm">
                <span className="font-semibold text-on-surface">
                  {closure.starts_on} → {closure.ends_on}
                </span>
                <span className="text-on-surface-variant">
                  {" "}
                  · {closure.shift_id ? "One shift" : "Whole farm"}
                </span>
                <span className="mt-1 block text-on-surface-variant">{closure.reason}</span>
              </div>
              {canMutate ? (
                <form action={deleteClosureAction} aria-busy={deleteClosurePending}>
                  <input type="hidden" name="closureId" value={closure.id} />
                  <button
                    type="submit"
                    disabled={deleteClosurePending}
                    className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-label-sm text-label-sm text-error disabled:opacity-60"
                  >
                    {deleteClosurePending ? "Removing…" : "Remove"}
                  </button>
                </form>
              ) : null}
            </li>
          ))}
          {snapshot.closures.length === 0 ? (
            <li className="font-body-sm text-body-sm text-on-surface-variant"><Tx>No closures on record.</Tx></li>
          ) : null}
        </ul>
        {canMutate ? (
          <ClosureCreateForm
            key={closureFormKey}
            shifts={snapshot.shifts}
            formAction={closureAction}
            pending={closurePending}
            initial={closureState.fields}
          />
        ) : null}
      </section>

      <section className="flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary"><Tx>Restaurant tables</Tx></h2>
        <MutationBanner state={tableBanner} />
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="min-w-full font-body-sm text-body-sm">
            <thead className="bg-surface-container text-left text-on-surface-variant">
              <tr>
                <th className="px-space-md py-space-sm">Label</th>
                <th className="px-space-md py-space-sm">Seats</th>
                <th className="px-space-md py-space-sm">Active</th>
                <th className="px-space-md py-space-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.tables.map((table) => (
                <tr key={table.id} className="border-t border-outline-variant/20">
                  <td className="px-space-md py-space-sm font-medium">{table.label}</td>
                  <td className="px-space-md py-space-sm">{table.seat_count}</td>
                  <td className="px-space-md py-space-sm">{table.is_active ? "Yes" : "No"}</td>
                  <td className="px-space-md py-space-sm">
                    {canMutate ? (
                      <form action={tableToggleAction} aria-busy={tableTogglePending}>
                        <input type="hidden" name="tableId" value={table.id} />
                        <input type="hidden" name="isActive" value={table.is_active ? "false" : "true"} />
                        <button
                          type="submit"
                          disabled={tableTogglePending}
                          className="rounded-lg border border-outline-variant/50 px-space-sm py-1 font-label-sm text-label-sm text-primary disabled:opacity-60"
                        >
                          {tableTogglePending ? "Updating…" : table.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canMutate ? (
          <TableCreateForm
            key={tableFormKey}
            formAction={tableAction}
            pending={tablePending}
            initial={tableState.fields}
          />
        ) : null}
      </section>
    </div>
  );
}

function ClosureCreateForm({
  shifts,
  formAction,
  pending,
  initial,
}: {
  shifts: ServiceShiftRow[];
  formAction: (payload: FormData) => void;
  pending: boolean;
  initial?: Record<string, string>;
}) {
  const [startsOn, setStartsOn] = useState(initial?.startsOn ?? "");
  const [endsOn, setEndsOn] = useState(initial?.endsOn ?? "");
  const [shiftId, setShiftId] = useState(initial?.shiftId ?? "all");
  const [reason, setReason] = useState(initial?.reason ?? "");

  return (
    <form
      action={formAction}
      className="grid max-w-xl grid-cols-1 gap-space-sm sm:grid-cols-2"
      aria-busy={pending}
    >
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        <Tx>Starts on</Tx>
        <input
          className={fieldClass}
          type="date"
          name="startsOn"
          value={startsOn}
          onChange={(event) => setStartsOn(event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        Ends on
        <input
          className={fieldClass}
          type="date"
          name="endsOn"
          value={endsOn}
          onChange={(event) => setEndsOn(event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 font-body-sm text-body-sm sm:col-span-2">
        Scope
        <select
          className={fieldClass}
          name="shiftId"
          value={shiftId}
          onChange={(event) => setShiftId(event.target.value)}
        >
          <option value="all"><Tx>Whole farm (all shifts that day)</Tx></option>
          {shifts.map((shift) => (
            <option key={shift.id} value={shift.id}>
              {shift.name} ({ISO_WEEKDAY[shift.day_of_week]} {shift.starts_at.slice(0, 5)}–
              {shift.ends_at.slice(0, 5)})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 font-body-sm text-body-sm sm:col-span-2">
        <Tx>Reason (staff-visible only)</Tx>
        <input
          className={fieldClass}
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          maxLength={200}
          placeholder="Private harvest day"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-primary px-space-md py-space-sm font-body-md text-body-md text-on-primary disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Add closure"}
      </button>
    </form>
  );
}

function TableCreateForm({
  formAction,
  pending,
  initial,
}: {
  formAction: (payload: FormData) => void;
  pending: boolean;
  initial?: Record<string, string>;
}) {
  const [tableLabel, setTableLabel] = useState(initial?.label ?? "");
  const [seatCount, setSeatCount] = useState(initial?.seatCount ?? "4");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? "0");

  return (
    <form
      action={formAction}
      className="grid max-w-md grid-cols-1 gap-space-sm sm:grid-cols-2"
      aria-busy={pending}
    >
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        Label
        <input
          className={fieldClass}
          name="label"
          value={tableLabel}
          onChange={(event) => setTableLabel(event.target.value)}
          required
          maxLength={20}
        />
      </label>
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        Seats
        <input
          className={fieldClass}
          name="seatCount"
          type="number"
          min={1}
          max={24}
          value={seatCount}
          onChange={(event) => setSeatCount(event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 font-body-sm text-body-sm sm:col-span-2">
        <Tx>Sort order</Tx>
        <input
          className={fieldClass}
          name="sortOrder"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-primary px-space-md py-space-sm font-body-md text-body-md text-on-primary disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Add table"}
      </button>
    </form>
  );
}

function ShiftRow({
  shift,
  canMutate,
  formAction,
  pending,
  totalActiveSeats,
}: {
  shift: ServiceShiftRow;
  canMutate: boolean;
  formAction: (payload: FormData) => void;
  pending: boolean;
  totalActiveSeats: number;
}) {
  const coversAboveSeating =
    totalActiveSeats > 0 && shift.max_covers > totalActiveSeats;

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 items-end gap-space-sm rounded-lg bg-surface-container-low p-space-md md:grid-cols-[1fr_auto_auto_auto]"
      aria-busy={pending}
    >
      <div>
        <p className="font-semibold text-on-surface">{shift.name}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {ISO_WEEKDAY[shift.day_of_week]} · {shift.starts_at.slice(0, 5)}–{shift.ends_at.slice(0, 5)}
        </p>
        {coversAboveSeating ? (
          <p className="mt-1 font-body-sm text-body-sm text-on-surface" role="note">
            Max covers ({shift.max_covers}) exceeds active seating ({totalActiveSeats}). Lower the
            limit before activating this shift.
          </p>
        ) : null}
      </div>
      <input type="hidden" name="shiftId" value={shift.id} />
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        <Tx>Max covers</Tx>
        <input
          className={cn(fieldClass, "w-28")}
          name="maxCovers"
          type="number"
          min={1}
          max={500}
          defaultValue={shift.max_covers}
          disabled={!canMutate}
        />
      </label>
      <label className="flex items-center gap-2 font-body-sm text-body-sm">
        <input
          type="checkbox"
          name="isActive"
          value="on"
          defaultChecked={shift.is_active}
          disabled={!canMutate}
        />
        Active
      </label>
      {canMutate ? (
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save shift"}
        </button>
      ) : null}
    </form>
  );
}
