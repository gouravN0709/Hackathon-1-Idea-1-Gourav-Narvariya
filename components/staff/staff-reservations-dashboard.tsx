"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  initialStaffReservationMutationState,
  runStaffReservationMutation,
  type StaffReservationMutationState,
} from "@/app/staff/reservations/actions";
import { proposedReservationActions } from "@/lib/staff/reservation-actions";
import type { StaffReservationActionId } from "@/lib/staff/reservation-actions";
import { formatArrivalTime, formatServiceDateLabel } from "@/lib/staff/format";
import { reservationMatchesReference } from "@/lib/staff/reference-match";
import {
  statusBadgeClass,
  statusLabels,
} from "@/lib/staff/reservation-status";
import { RESERVATION_NOTES_MAX_LENGTH } from "@/lib/staff/validate-reservation-mutation";
import type { ReservationStatus, StaffReservationRow } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";
import { cn } from "@/lib/cn";

export type ReservationDashboardRow = StaffReservationRow & {
  guestEmail?: string | null;
  guestPhone?: string | null;
};

type ReservationMutationAction = (
  prevState: StaffReservationMutationState,
  formData: FormData,
) => Promise<StaffReservationMutationState>;

type StaffReservationsDashboardProps = {
  rows: ReservationDashboardRow[];
  initialServiceDate: string;
  initialStatus: ReservationStatus | "all";
  initialReference: string;
  emptyMessage?: string;
  guestLabel?: string;
  /** When false, actions stay disabled (demo / preview). */
  enableMutations?: boolean;
  /** When false, rows are already filtered on the server (admin list). */
  clientSideFilter?: boolean;
  showGuestContact?: boolean;
  referenceFieldLabel?: string;
  reservationMutationAction?: ReservationMutationAction;
  reservationMutationInitialState?: StaffReservationMutationState;
};

function actionRequiresNote(actionId: StaffReservationActionId): boolean {
  return actionId === "cancel" || actionId === "mark_no_show";
}

export function StaffReservationsDashboard({
  rows,
  initialServiceDate,
  initialStatus,
  initialReference,
  emptyMessage = "No reservations match these filters.",
  guestLabel = "Guest",
  enableMutations = false,
  clientSideFilter = true,
  showGuestContact = false,
  referenceFieldLabel = "Reference",
  reservationMutationAction = runStaffReservationMutation,
  reservationMutationInitialState = initialStaffReservationMutationState,
}: StaffReservationsDashboardProps) {
  const router = useRouter();
  const [serviceDate, setServiceDate] = useState(initialServiceDate);
  const [status, setStatus] = useState<ReservationStatus | "all">(initialStatus);
  const [reference, setReference] = useState(initialReference);
  const [selectedId, setSelectedId] = useState<string | null>(
    rows[0]?.id ?? null,
  );
  const [actionNote, setActionNote] = useState("");

  const [mutationState, mutationAction, mutationPending] = useActionState(
    reservationMutationAction,
    reservationMutationInitialState,
  );

  const filtered = useMemo(() => {
    if (!clientSideFilter) {
      return rows;
    }
    return rows.filter((row) => {
      if (serviceDate && row.serviceDate !== serviceDate) {
        return false;
      }
      if (status !== "all" && row.status !== status) {
        return false;
      }
      if (!reservationMatchesReference(row.id, reference)) {
        return false;
      }
      return true;
    });
  }, [clientSideFilter, rows, serviceDate, status, reference]);

  const selected =
    filtered.find((row) => row.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (mutationState.success) {
      router.refresh();
    }
  }, [mutationState.success, router]);

  const statusActions = selected
    ? proposedReservationActions(selected.status).filter(
        (action) => action.id !== "edit_notes",
      )
    : [];

  const showActionNoteField = statusActions.some(
    (action) => action.implemented && actionRequiresNote(action.id),
  );

  return (
    <div className="flex flex-col gap-space-xl lg:flex-row lg:items-start">
      <section className="min-w-0 flex-1 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg">
        <form
          className="grid gap-space-md sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              <Tx>Service date</Tx>
            </span>
            <input
              type="date"
              className="min-h-11 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3"
              value={serviceDate}
              onChange={(event) => setServiceDate(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Status
            </span>
            <select
              className="min-h-11 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ReservationStatus | "all")
              }
            >
              <option value="all"><Tx>All statuses</Tx></option>
              {reservationStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-space-xs sm:col-span-2 lg:col-span-1">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              {referenceFieldLabel}
            </span>
            <input
              type="search"
              placeholder="ITU-…"
              className="min-h-11 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </label>
        </form>

        <div className="mt-space-lg overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left font-body-md text-body-md">
            <thead>
              <tr className="border-b border-outline-variant/40 text-on-surface-variant">
                <th className="py-space-sm pr-space-md font-semibold"><Tx>Reference</Tx></th>
                <th className="py-space-sm pr-space-md font-semibold">Date</th>
                <th className="py-space-sm pr-space-md font-semibold">Time</th>
                <th className="py-space-sm pr-space-md font-semibold">Party</th>
                <th className="py-space-sm pr-space-md font-semibold">Status</th>
                <th className="py-space-sm font-semibold">Tables</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-space-lg text-on-surface-variant"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-b border-outline-variant/20 transition-colors hover:bg-surface-container",
                      selected?.id === row.id && "bg-surface-container-high",
                    )}
                    onClick={() => {
                      setSelectedId(row.id);
                      setActionNote("");
                    }}
                  >
                    <td className="py-space-sm pr-space-md font-medium text-primary">
                      {row.reference}
                    </td>
                    <td className="py-space-sm pr-space-md whitespace-nowrap">
                      {row.serviceDate}
                    </td>
                    <td className="py-space-sm pr-space-md">
                      {formatArrivalTime(row.arrivalTime)}
                    </td>
                    <td className="py-space-sm pr-space-md">{row.partySize}</td>
                    <td className="py-space-sm pr-space-md">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold",
                          statusBadgeClass(row.status),
                        )}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td className="py-space-sm">
                      {row.tableLabels.length > 0
                        ? row.tableLabels.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="w-full shrink-0 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-lg lg:max-w-md">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          <Tx>Reservation detail</Tx>
        </h2>
        {!selected ? (
          <p className="mt-space-md text-on-surface-variant">
            <Tx>Select a row to inspect status and actions.</Tx>
          </p>
        ) : (
          <dl className="mt-space-md flex flex-col gap-space-sm font-body-md text-body-md">
            <div>
              <dt className="text-on-surface-variant"><Tx>Reference</Tx></dt>
              <dd className="font-semibold text-primary">{selected.reference}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Service</dt>
              <dd>
                {formatServiceDateLabel(selected.serviceDate)}
                {selected.shiftName ? ` · ${selected.shiftName}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Arrival</dt>
              <dd>{formatArrivalTime(selected.arrivalTime)}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Party</dt>
              <dd>
                {selected.adultCount} adults
                {selected.childCount > 0
                  ? `, ${selected.childCount} children`
                  : ""}{" "}
                ({selected.partySize} total)
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Status</dt>
              <dd>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold",
                    statusBadgeClass(selected.status),
                  )}
                >
                  {statusLabels[selected.status]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Tables</dt>
              <dd>
                {selected.tableLabels.length > 0
                  ? selected.tableLabels.join(", ")
                  : "None assigned"}
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">{guestLabel}</dt>
              <dd>{selected.guestDisplayName}</dd>
            </div>
            {showGuestContact && selected.guestEmail ? (
              <div>
                <dt className="text-on-surface-variant">Email</dt>
                <dd>
                  <a
                    href={`mailto:${selected.guestEmail}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {selected.guestEmail}
                  </a>
                </dd>
              </div>
            ) : null}
            {showGuestContact && selected.guestPhone ? (
              <div>
                <dt className="text-on-surface-variant">Phone</dt>
                <dd>
                  <a
                    href={`tel:${selected.guestPhone}`}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {selected.guestPhone}
                  </a>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-on-surface-variant">Last updated</dt>
              <dd className="text-on-surface-variant">{selected.updatedAt}</dd>
            </div>
            {selected.notes ? (
              <div>
                <dt className="text-on-surface-variant">Notes</dt>
                <dd className="text-pretty whitespace-pre-wrap">{selected.notes}</dd>
              </div>
            ) : null}
          </dl>
        )}

        {mutationState.error ? (
          <p
            className="mt-space-md rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container"
            role="alert"
          >
            {mutationState.error}
          </p>
        ) : null}
        {mutationState.success && mutationState.message ? (
          <p
            className="mt-space-md rounded-lg bg-primary-fixed px-space-md py-space-sm text-on-primary-fixed-variant"
            role="status"
          >
            {mutationState.message}
          </p>
        ) : null}

        {selected && enableMutations ? (
          <div className="mt-space-lg border-t border-outline-variant/30 pt-space-md">
            <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              <Tx>Staff notes</Tx>
            </h3>
            <form
              key={`notes-${selected.id}-${selected.updatedAt}`}
              action={mutationAction}
              className="mt-space-sm flex flex-col gap-space-sm"
            >
              <input type="hidden" name="reservationId" value={selected.id} />
              <input type="hidden" name="updatedAt" value={selected.updatedAt} />
              <input type="hidden" name="action" value="edit_notes" />
              <textarea
                name="notes"
                rows={4}
                maxLength={RESERVATION_NOTES_MAX_LENGTH}
                defaultValue={selected.notes ?? ""}
                disabled={mutationPending}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2"
                aria-label="Staff notes"
              />
              <p className="text-label-sm text-on-surface-variant">
                Up to {RESERVATION_NOTES_MAX_LENGTH} characters
              </p>
              <button
                type="submit"
                disabled={mutationPending}
                className="rounded-lg bg-primary px-space-md py-space-sm font-body-md text-body-md text-on-primary disabled:opacity-60"
              >
                {mutationPending ? "Saving…" : "Save notes"}
              </button>
            </form>
          </div>
        ) : null}

        {selected ? (
          <div className="mt-space-lg border-t border-outline-variant/30 pt-space-md">
            <h3 className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              {enableMutations ? "Actions" : "Proposed actions (disabled)"}
            </h3>

            {enableMutations && showActionNoteField ? (
              <label className="mt-space-sm flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  <Tx>Note for cancel / no-show (required)</Tx>
                </span>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  disabled={mutationPending}
                  className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2"
                />
              </label>
            ) : null}

            <ul className="mt-space-sm flex flex-col gap-space-sm">
              {statusActions.map((action) => {
                const canRun = enableMutations && action.implemented;
                const needsNote = actionRequiresNote(action.id);
                const noteTooShort =
                  needsNote && actionNote.trim().length < 3;

                return (
                  <li key={action.id}>
                    {canRun ? (
                      <form action={mutationAction}>
                        <input
                          type="hidden"
                          name="reservationId"
                          value={selected.id}
                        />
                        <input
                          type="hidden"
                          name="updatedAt"
                          value={selected.updatedAt}
                        />
                        <input type="hidden" name="action" value={action.id} />
                        {needsNote ? (
                          <input
                            type="hidden"
                            name="actionNote"
                            value={actionNote}
                          />
                        ) : null}
                        <button
                          type="submit"
                          disabled={mutationPending || (needsNote && noteTooShort)}
                          title={action.detail}
                          className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-left font-body-md text-body-md text-on-surface hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {mutationPending ? "Working…" : action.label}
                          {action.targetStatus
                            ? ` → ${statusLabels[action.targetStatus]}`
                            : ""}
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title={action.detail}
                        className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-space-md py-space-sm text-left font-body-md text-body-md text-on-surface-variant opacity-70"
                      >
                        {action.label}
                        {action.targetStatus
                          ? ` → ${statusLabels[action.targetStatus]}`
                          : ""}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {!enableMutations ? (
              <p className="mt-space-sm text-label-sm text-on-surface-variant">
                Live mutations are available on the signed-in reservations page
                only.
              </p>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
