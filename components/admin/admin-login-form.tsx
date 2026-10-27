"use client";
import { Tx } from "@/components/i18n/tx";

import { useActionState } from "react";
import {
  signInAdmin,
  type AdminSignInState,
} from "@/app/admin/login/actions";

const initialState: AdminSignInState = { error: null };

const inputClass =
  "w-full min-h-11 rounded-lg border border-[#294632]/25 bg-white px-4 py-3 font-body-md text-body-md text-[#292B25] outline-none focus:shadow-[0_0_0_2px_rgba(41,70,50,0.35)]";

type AdminLoginFormProps = {
  nextPath: string;
  disabled?: boolean;
};

export function AdminLoginForm({ nextPath, disabled = false }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-space-md py-space-2xl">
      <div className="rounded-2xl border border-[#294632]/15 bg-[#F3EBDD] p-space-xl shadow-sm">
        <h1 className="font-headline-lg text-headline-lg-mobile text-[#294632]">
          Admin sign in
        </h1>
        <p className="mt-space-sm font-body-md text-body-md text-[#424842]">
          Owner and manager profiles only. Floor staff should use the{" "}
          <span className="font-medium">staff panel</span>.
        </p>

        <form action={formAction} className="mt-space-lg flex flex-col gap-space-md">
          <input type="hidden" name="next" value={nextPath} />
          <label className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-[#424842]">
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
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wide text-[#424842]">
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
            className="min-h-11 rounded-lg bg-[#294632] px-space-lg py-space-sm font-body-md text-body-md font-semibold text-[#F3EBDD] transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
