"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState } from "react";
import { createAdminReservation } from "@/app/admin/(panel)/reservations/actions";
import { initialAdminCreateReservationState } from "@/app/admin/(panel)/reservations/mutation-state";
import { arrivalTimes } from "@/lib/booking/constants";

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#294632]/20 bg-white px-3 font-body-md text-body-md";

type AdminCreateReservationFormProps = {
  defaultDate: string;
};

export function AdminCreateReservationForm({
  defaultDate,
}: AdminCreateReservationFormProps) {
  const [state, formAction, pending] = useActionState(
    createAdminReservation,
    initialAdminCreateReservationState,
  );

  const fields = state.fields ?? {
    date: defaultDate,
    arrival: arrivalTimes[0],
    adults: "2",
    children: "0",
    name: "",
    email: "",
    phone: "",
    notes: "",
  };

  return (
    <section className="rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
      <h2 className="font-headline-sm text-headline-sm text-[#294632]">
        Create reservation
      </h2>
      <p className="mt-space-xs text-label-sm text-[#424842]">
        Uses the same booking rules and capacity checks as the public form.
      </p>

      <form action={formAction} className="mt-space-lg grid gap-space-md sm:grid-cols-2">
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            <Tx>Service date</Tx>
          </span>
          <input
            className={inputClass}
            type="date"
            name="date"
            required
            defaultValue={fields.date || defaultDate}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Arrival
          </span>
          <select
            className={inputClass}
            name="arrival"
            defaultValue={fields.arrival}
            disabled={pending}
          >
            {arrivalTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Adults
          </span>
          <input
            className={inputClass}
            type="number"
            name="adults"
            min={1}
            required
            defaultValue={fields.adults}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Children
          </span>
          <input
            className={inputClass}
            type="number"
            name="children"
            min={0}
            required
            defaultValue={fields.children}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs sm:col-span-2">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Guest name
          </span>
          <input
            className={inputClass}
            name="name"
            required
            defaultValue={fields.name}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Email
          </span>
          <input
            className={inputClass}
            type="email"
            name="email"
            required
            defaultValue={fields.email}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Phone
          </span>
          <input
            className={inputClass}
            name="phone"
            required
            defaultValue={fields.phone}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-space-xs sm:col-span-2">
          <span className="font-label-sm text-label-sm font-semibold uppercase text-[#424842]">
            Notes
          </span>
          <textarea
            className={inputClass}
            name="notes"
            rows={3}
            defaultValue={fields.notes}
            disabled={pending}
          />
        </label>
        <div className="sm:col-span-2">
          {state.error ? (
            <p className="mb-space-sm rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
              {state.error}
            </p>
          ) : null}
          {state.success && state.message ? (
            <p className="mb-space-sm rounded-lg bg-primary-fixed px-space-md py-space-sm text-on-primary-fixed-variant">
              {state.message}
              {state.reference ? ` Reference ${state.reference}.` : ""}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-lg bg-[#B77948] px-space-lg font-body-md text-body-md font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create reservation"}
          </button>
        </div>
      </form>
    </section>
  );
}
