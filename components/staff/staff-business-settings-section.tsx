"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState, useState } from "react";
import {
  initialStaffOperationsMutationState,
  updateBusinessSettingsTimezone,
} from "@/app/staff/operations/actions";
import type { BusinessSettingsRow } from "@/lib/staff/load-operations-snapshot";

const fieldClass =
  "w-full min-h-11 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-body-sm text-body-sm text-on-surface";

const SUGGESTED_TIMEZONES = [
  "Europe/Madrid",
  "Atlantic/Canary",
  "Europe/Lisbon",
  "UTC",
] as const;

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

type StaffBusinessSettingsSectionProps = {
  businessSettings: BusinessSettingsRow | null;
  canEdit: boolean;
};

export function StaffBusinessSettingsSection({
  businessSettings,
  canEdit,
}: StaffBusinessSettingsSectionProps) {
  const [state, formAction, pending] = useActionState(
    updateBusinessSettingsTimezone,
    initialStaffOperationsMutationState,
  );

  const editorKey = state.error
    ? `err-${state.fields?.timezone ?? "invalid"}`
    : (businessSettings?.timezone ?? "none");

  return (
    <section className="flex flex-col gap-space-md">
      <h2 className="font-headline-sm text-headline-sm text-primary"><Tx>Business settings</Tx></h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Service dates and opening hours are interpreted in this IANA timezone. Only owners can
        change it; managers and floor staff can view the current value.
      </p>
      <MutationBanner state={state} />
      <dl className="font-body-sm text-body-sm text-on-surface">
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-space-md">
          <dt className="text-on-surface-variant"><Tx>Current timezone</Tx></dt>
          <dd className="font-medium">{businessSettings?.timezone ?? "Not loaded"}</dd>
        </div>
      </dl>
      {canEdit ? (
        <TimezoneEditorForm
          key={editorKey}
          formAction={formAction}
          pending={pending}
          initialTimezone={state.fields?.timezone ?? businessSettings?.timezone ?? "Europe/Madrid"}
        />
      ) : null}
    </section>
  );
}

function TimezoneEditorForm({
  formAction,
  pending,
  initialTimezone,
}: {
  formAction: (payload: FormData) => void;
  pending: boolean;
  initialTimezone: string;
}) {
  const [timezone, setTimezone] = useState(initialTimezone);

  return (
    <form
      action={formAction}
      className="grid max-w-md grid-cols-1 gap-space-sm"
      aria-busy={pending}
    >
      <label className="flex flex-col gap-1 font-body-sm text-body-sm">
        <Tx>Timezone (IANA)</Tx>
        <input
          className={fieldClass}
          name="timezone"
          list="iana-timezone-hints"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          maxLength={64}
          required
          aria-describedby="timezone-help"
        />
      </label>
      <p id="timezone-help" className="font-body-sm text-body-sm text-on-surface-variant">
        Examples: {SUGGESTED_TIMEZONES.join(", ")}. The database rejects unknown zones.
      </p>
      <datalist id="iana-timezone-hints">
        {SUGGESTED_TIMEZONES.map((tz) => (
          <option key={tz} value={tz} />
        ))}
      </datalist>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-primary px-space-md py-space-sm font-body-md text-body-md text-on-primary disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save timezone"}
      </button>
    </form>
  );
}
