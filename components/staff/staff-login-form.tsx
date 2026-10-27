"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState } from "react";
import {
  signInStaff,
  type StaffSignInState,
} from "@/app/staff/login/actions";
import { SiteContainer } from "@/components/ui/site-container";

const initialState: StaffSignInState = { error: null };

const inputClass =
  "w-full min-h-11 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface outline-none focus:shadow-[0_0_0_2px_rgba(19,47,29,0.35)]";

type StaffLoginFormProps = {
  nextPath: string;
  disabled?: boolean;
};

export function StaffLoginForm({ nextPath, disabled = false }: StaffLoginFormProps) {
  const [state, formAction, pending] = useActionState(signInStaff, initialState);

  return (
    <SiteContainer className="py-space-2xl">
      <div className="mx-auto max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-low p-space-xl shadow-sm">
        <h1 className="font-headline-lg text-headline-lg-mobile text-primary">
          <Tx>Staff sign in</Tx>
        </h1>
        <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
          Use the email and password from your Supabase Auth account. Access to
          reservations requires an active row in{" "}
          <span className="font-medium">staff_profiles</span>.
        </p>

        <form action={formAction} className="mt-space-lg flex flex-col gap-space-md">
          <input type="hidden" name="next" value={nextPath} />
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Email
            </span>
            <input
              className={inputClass}
              type="email"
              name="email"
              autoComplete="username"
              required
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              <Tx>Password</Tx>
            </span>
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={disabled}
            />
          </label>
          {state.error ? (
            <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || disabled}
            className="min-h-11 rounded-lg bg-primary px-space-lg py-space-sm font-body-md text-body-md font-semibold text-on-primary transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </SiteContainer>
  );
}
