"use client";

import { useActionState } from "react";
import {
  initialAdminStaffMutationState,
  updateStaffProfile,
} from "@/app/admin/(panel)/staff/actions";
import type { AdminStaffProfileRow } from "@/lib/admin/load-staff-profiles";

const inputClass =
  "min-h-10 w-full rounded-lg border border-[#294632]/20 bg-white px-2 font-body-md text-body-md";

type AdminStaffTableProps = {
  rows: AdminStaffProfileRow[];
  canMutate: boolean;
  ownerOnlyMessage?: string;
};

function StaffProfileForm({
  row,
  formAction,
  pending,
}: {
  row: AdminStaffProfileRow;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  return (
    <form
      action={formAction}
      className="grid gap-space-md rounded-xl border border-outline-variant/25 p-space-md sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <input type="hidden" name="profileId" value={row.id} />
      <label className="flex flex-col gap-space-xs lg:col-span-1">
        <span className="font-label-sm text-label-sm text-[#424842]">Name</span>
        <input
          className={inputClass}
          name="displayName"
          defaultValue={row.displayName}
          disabled={pending}
        />
      </label>
      <label className="flex flex-col gap-space-xs">
        <span className="font-label-sm text-label-sm text-[#424842]">Role</span>
        <select
          className={inputClass}
          name="role"
          defaultValue={row.role}
          disabled={pending}
        >
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
      </label>
      <label className="flex items-center gap-space-sm pt-space-lg">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={row.isActive}
          disabled={pending}
        />
        Active
      </label>
      <p className="font-mono text-label-sm text-on-surface-variant lg:col-span-1">
        {row.userId}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="min-h-10 rounded-lg bg-[#294632] px-space-md font-semibold text-[#F3EBDD] disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
}

export function AdminStaffTable({
  rows,
  canMutate,
  ownerOnlyMessage,
}: AdminStaffTableProps) {
  const [state, formAction, pending] = useActionState(
    updateStaffProfile,
    initialAdminStaffMutationState,
  );

  return (
    <div className="flex flex-col gap-space-md">
      {!canMutate && ownerOnlyMessage ? (
        <p className="rounded-lg bg-surface-container-high px-space-md py-space-sm text-on-surface-variant">
          {ownerOnlyMessage}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
          {state.error}
        </p>
      ) : null}
      {state.success && state.message ? (
        <p className="rounded-lg bg-primary-fixed px-space-md py-space-sm text-on-primary-fixed-variant">
          {state.message}
        </p>
      ) : null}

      {canMutate ? (
        <div className="flex flex-col gap-space-md">
          {rows.length === 0 ? (
            <p className="text-on-surface-variant">No staff profiles found.</p>
          ) : (
            rows.map((row) => (
              <StaffProfileForm
                key={row.id}
                row={row}
                formAction={formAction}
                pending={pending}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#294632]/10 bg-white p-space-lg">
          <table className="w-full min-w-[640px] text-left font-body-md text-body-md">
            <thead>
              <tr className="border-b border-outline-variant/40 text-[#424842]">
                <th className="py-space-sm pr-space-md">Name</th>
                <th className="py-space-sm pr-space-md">Role</th>
                <th className="py-space-sm pr-space-md">Active</th>
                <th className="py-space-sm">User ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-space-lg text-on-surface-variant">
                    No staff profiles found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-outline-variant/20">
                    <td className="py-space-md pr-space-md font-semibold">
                      {row.displayName}
                    </td>
                    <td className="py-space-md pr-space-md capitalize">{row.role}</td>
                    <td className="py-space-md pr-space-md">
                      {row.isActive ? "Yes" : "No"}
                    </td>
                    <td className="py-space-md font-mono text-label-sm text-on-surface-variant">
                      {row.userId}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-label-sm text-on-surface-variant">
        New Auth users must be created in Supabase Auth, then linked with a{" "}
        <span className="font-medium">staff_profiles</span> row via the bootstrap script
        or service-role tooling. Profiles cannot be inserted from the browser.
      </p>
    </div>
  );
}
