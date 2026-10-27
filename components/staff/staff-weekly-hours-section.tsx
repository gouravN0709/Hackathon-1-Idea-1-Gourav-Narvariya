"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import {
  createWeeklyHours,
  deleteWeeklyHours,
  initialStaffOperationsMutationState,
  updateWeeklyHours,
} from "@/app/staff/operations/actions";
import type { ServiceShiftRow, WeeklyHoursRow } from "@/lib/staff/load-operations-snapshot";
import {
  previewWeeklyHoursChange,
  previewWeeklyHoursDelete,
  weeklyHoursDraftFromInput,
} from "@/lib/staff/weekly-hours-validation";

const ISO_WEEKDAY = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const fieldClass =
  "w-full min-h-11 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-body-sm text-body-sm text-on-surface";

function timeInputValue(dbTime: string): string {
  return dbTime.slice(0, 5);
}

function MutationBanner({ state }: { state: typeof initialStaffOperationsMutationState }) {
  if (state.error) {
    return (
      <p
        className="rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm text-on-error-container"
        role="alert"
      >
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return (
      <p
        className="rounded-lg bg-primary-container/30 p-space-sm font-body-sm text-body-sm text-primary"
        role="status"
      >
        {state.message}
      </p>
    );
  }
  return null;
}

function PreviewNote({ children }: { children: ReactNode }) {
  return (
    <p className="font-body-sm text-body-sm text-on-surface-variant" role="status">
      {children}
    </p>
  );
}

type StaffWeeklyHoursSectionProps = {
  weeklyHours: WeeklyHoursRow[];
  shifts: ServiceShiftRow[];
  canMutate: boolean;
};

export function StaffWeeklyHoursSection({
  weeklyHours,
  shifts,
  canMutate,
}: StaffWeeklyHoursSectionProps) {
  const [createState, createAction, createPending] = useActionState(
    createWeeklyHours,
    initialStaffOperationsMutationState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateWeeklyHours,
    initialStaffOperationsMutationState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteWeeklyHours,
    initialStaffOperationsMutationState,
  );

  const [newDay, setNewDay] = useState("4");
  const [newOpens, setNewOpens] = useState("13:00");
  const [newCloses, setNewCloses] = useState("16:00");

  const createPreview = useMemo(() => {
    const parsed = weeklyHoursDraftFromInput({
      dayOfWeek: newDay,
      opensAt: newOpens,
      closesAt: newCloses,
    });
    if (!parsed.ok) {
      return { ok: false as const, message: parsed.message };
    }
    const preview = previewWeeklyHoursChange(weeklyHours, shifts, parsed.value);
    if (preview.overlap) {
      return { ok: false as const, message: "Overlaps another block on this day." };
    }
    if (preview.shiftConflict) {
      return { ok: false as const, message: preview.shiftConflict };
    }
    return { ok: true as const, message: "Looks valid before save (database rules still apply)." };
  }, [newCloses, newDay, newOpens, shifts, weeklyHours]);

  const bannerState = [createState, updateState, deleteState].find(
    (s) => s.error || (s.success && s.message),
  ) ?? initialStaffOperationsMutationState;

  return (
    <section className="flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-primary"><Tx>Weekly hours</Tx></h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Operating windows per ISO weekday. Overlap and active-shift coverage are checked here and
        enforced again in the database.
      </p>
      <MutationBanner state={bannerState} />

      <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
        <table className="min-w-full font-body-sm text-body-sm">
          <thead className="bg-surface-container text-left text-on-surface-variant">
            <tr>
              <th className="px-space-md py-space-sm">Day</th>
              <th className="px-space-md py-space-sm">Opens</th>
              <th className="px-space-md py-space-sm">Closes</th>
              {canMutate ? <th className="px-space-md py-space-sm">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {weeklyHours.map((row) => (
              <WeeklyHoursRowEditor
                key={row.id}
                row={row}
                weeklyHours={weeklyHours}
                shifts={shifts}
                canMutate={canMutate}
                formAction={updateAction}
                pending={updatePending}
                deleteAction={deleteAction}
                deletePending={deletePending}
              />
            ))}
            {weeklyHours.length === 0 ? (
              <tr>
                <td
                  colSpan={canMutate ? 4 : 3}
                  className="px-space-md py-space-sm text-on-surface-variant"
                >
                  <Tx>No weekly hours configured.</Tx>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {canMutate ? (
        <form
          action={createAction}
          className="grid max-w-xl grid-cols-1 gap-space-sm sm:grid-cols-3"
          aria-busy={createPending}
        >
          <label className="flex flex-col gap-1 font-body-sm text-body-sm">
            Day
            <select
              className={fieldClass}
              name="dayOfWeek"
              value={newDay}
              onChange={(event) => setNewDay(event.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={String(day)}>
                  {ISO_WEEKDAY[day]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-body-sm text-body-sm">
            Opens
            <input
              className={fieldClass}
              type="time"
              name="opensAt"
              value={newOpens}
              onChange={(event) => setNewOpens(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 font-body-sm text-body-sm">
            Closes
            <input
              className={fieldClass}
              type="time"
              name="closesAt"
              value={newCloses}
              onChange={(event) => setNewCloses(event.target.value)}
              required
            />
          </label>
          <div className="sm:col-span-3">
            <PreviewNote>{createPreview.message}</PreviewNote>
          </div>
          <button
            type="submit"
            disabled={createPending || !createPreview.ok}
            className="min-h-11 rounded-lg bg-primary px-space-md py-space-sm font-body-md text-body-md text-on-primary disabled:opacity-60 sm:col-span-3"
          >
            {createPending ? "Saving…" : "Add hours block"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

function WeeklyHoursRowEditor({
  row,
  weeklyHours,
  shifts,
  canMutate,
  formAction,
  pending,
  deleteAction,
  deletePending,
}: {
  row: WeeklyHoursRow;
  weeklyHours: WeeklyHoursRow[];
  shifts: ServiceShiftRow[];
  canMutate: boolean;
  formAction: (payload: FormData) => void;
  pending: boolean;
  deleteAction: (payload: FormData) => void;
  deletePending: boolean;
}) {
  const [day, setDay] = useState(String(row.day_of_week));
  const [opens, setOpens] = useState(timeInputValue(row.opens_at));
  const [closes, setCloses] = useState(timeInputValue(row.closes_at));

  const rowPreview = useMemo(() => {
    const parsed = weeklyHoursDraftFromInput({
      dayOfWeek: day,
      opensAt: opens,
      closesAt: closes,
    });
    if (!parsed.ok) {
      return { ok: false as const, message: parsed.message };
    }
    const draft = { ...parsed.value, id: row.id };
    const preview = previewWeeklyHoursChange(weeklyHours, shifts, draft);
    if (preview.overlap) {
      return { ok: false as const, message: "Overlaps another block on this day." };
    }
    if (preview.shiftConflict) {
      return { ok: false as const, message: preview.shiftConflict };
    }
    return { ok: true as const, message: null };
  }, [closes, day, opens, row.id, shifts, weeklyHours]);

  const deletePreview = useMemo(
    () => previewWeeklyHoursDelete(weeklyHours, shifts, row.id),
    [row.id, shifts, weeklyHours],
  );

  if (!canMutate) {
    return (
      <tr className="border-t border-outline-variant/20">
        <td className="px-space-md py-space-sm">{ISO_WEEKDAY[row.day_of_week] ?? row.day_of_week}</td>
        <td className="px-space-md py-space-sm">{timeInputValue(row.opens_at)}</td>
        <td className="px-space-md py-space-sm">{timeInputValue(row.closes_at)}</td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-outline-variant/20 align-top">
      <td className="px-space-md py-space-sm" colSpan={3}>
        <form
          action={formAction}
          className="grid grid-cols-1 gap-space-sm sm:grid-cols-[minmax(6rem,1fr)_minmax(7rem,1fr)_minmax(7rem,1fr)_auto]"
          aria-busy={pending}
        >
          <input type="hidden" name="hoursId" value={row.id} />
          <select
            className={fieldClass}
            name="dayOfWeek"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            aria-label={`Day for hours block`}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={String(d)}>
                {ISO_WEEKDAY[d]}
              </option>
            ))}
          </select>
          <input
            className={fieldClass}
            type="time"
            name="opensAt"
            value={opens}
            onChange={(event) => setOpens(event.target.value)}
            aria-label="Opens"
          />
          <input
            className={fieldClass}
            type="time"
            name="closesAt"
            value={closes}
            onChange={(event) => setCloses(event.target.value)}
            aria-label="Closes"
          />
          <button
            type="submit"
            disabled={pending || !rowPreview.ok}
            className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-body-md text-body-md text-primary disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          {!rowPreview.ok && rowPreview.message ? (
            <p className="sm:col-span-4 font-body-sm text-body-sm text-on-surface-variant">
              {rowPreview.message}
            </p>
          ) : null}
        </form>
      </td>
      <td className="px-space-md py-space-sm">
        <form action={deleteAction} aria-busy={deletePending}>
          <input type="hidden" name="hoursId" value={row.id} />
          <button
            type="submit"
            disabled={!deletePreview.ok || deletePending}
            className="min-h-11 rounded-lg border border-outline-variant/50 px-space-md py-space-sm font-label-sm text-label-sm text-error disabled:opacity-40"
            title={deletePreview.shiftConflict ?? undefined}
          >
            {deletePending ? "Removing…" : "Remove"}
          </button>
        </form>
        {!deletePreview.ok && deletePreview.shiftConflict ? (
          <p className="mt-1 max-w-xs font-body-sm text-body-sm text-on-surface-variant">
            {deletePreview.shiftConflict}
          </p>
        ) : null}
      </td>
    </tr>
  );
}
