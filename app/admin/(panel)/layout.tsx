import { connection } from "next/server";
import { headers } from "next/headers";
import { signOutAdmin } from "@/app/admin/login/actions";

export const instant = false;

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_HOME_PATH } from "@/lib/admin/admin-routes";
import { requireAdminAccess } from "@/lib/admin/require-admin-access";
import {
  readIntendedPathFromHeaders,
  REQUEST_PATHNAME_HEADER,
} from "@/lib/request-path";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const headerStore = await headers();
  const intendedPath = readIntendedPathFromHeaders(
    headerStore.get(REQUEST_PATHNAME_HEADER),
    ADMIN_HOME_PATH,
  );
  const gate = await requireAdminAccess(intendedPath);

  if (gate.status === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EBDD] px-space-md">
        <div className="max-w-md rounded-2xl border border-[#294632]/15 bg-white p-space-xl">
          <h1 className="font-headline-sm text-headline-sm text-[#294632]">
            Access denied
          </h1>
          <p className="mt-space-sm text-on-surface-variant">{gate.message}</p>
          <form action={signOutAdmin} className="mt-space-lg">
            <button
              type="submit"
              className="rounded-lg border border-outline-variant/50 px-space-md py-space-sm text-primary"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminShell session={gate.session} signOutAction={signOutAdmin}>
      {children}
    </AdminShell>
  );
}
