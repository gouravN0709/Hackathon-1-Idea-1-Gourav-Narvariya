"use client";
import { Tx } from "@/components/i18n/tx";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminSession } from "@/lib/admin/require-admin-access";
import {
  ADMIN_AVAILABILITY_PATH,
  ADMIN_CUSTOMERS_PATH,
  ADMIN_HOME_PATH,
  ADMIN_OPERATIONS_PATH,
  ADMIN_FLOOR_PLAN_PATH,
  ADMIN_RESERVATIONS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_STAFF_PATH,
} from "@/lib/admin/admin-routes";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: ADMIN_HOME_PATH, label: "Dashboard" },
  { href: ADMIN_RESERVATIONS_PATH, label: "Reservations" },
  { href: ADMIN_CUSTOMERS_PATH, label: "Customers" },
  { href: ADMIN_AVAILABILITY_PATH, label: "Availability" },
  { href: ADMIN_OPERATIONS_PATH, label: "Operations" },
  { href: ADMIN_FLOOR_PLAN_PATH, label: "Floor plan" },
  { href: ADMIN_SETTINGS_PATH, label: "Settings" },
  { href: ADMIN_STAFF_PATH, label: "Staff" },
] as const;

type AdminShellProps = {
  session: AdminSession;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function AdminShell({ session, signOutAction, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3EBDD] text-[#292B25]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#294632]/15 bg-[#294632] text-[#F3EBDD] transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="border-b border-white/10 px-space-lg py-space-lg">
            <p className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-[#D8DCCB]">
              SAGARDI Admin
            </p>
            <p className="mt-1 font-headline-sm text-headline-sm text-white">
              Iturrieta
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto px-space-sm py-space-md">
            <ul className="flex flex-col gap-space-xs">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === ADMIN_HOME_PATH
                    ? pathname === ADMIN_HOME_PATH
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-space-md py-space-sm font-body-md text-body-md transition-colors",
                        active
                          ? "bg-[#B77948] font-semibold text-white"
                          : "text-[#D8DCCB] hover:bg-white/10",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-white/10 px-space-md py-space-md text-label-sm">
            <p className="font-semibold text-white">{session.displayName}</p>
            <p className="capitalize text-[#D8DCCB]">{session.role}</p>
            <Link
              href="/staff/reservations"
              className="mt-space-sm inline-block text-[#D8DCCB] underline-offset-2 hover:underline"
            >
              Staff panel
            </Link>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-space-md border-b border-[#294632]/10 bg-[#F3EBDD]/95 px-space-md py-space-md backdrop-blur-sm lg:px-space-xl">
            <button
              type="button"
              className="rounded-lg border border-[#294632]/20 px-space-md py-space-sm font-body-md text-body-md lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <p className="hidden font-body-md text-body-md text-[#424842] lg:block">
              Restaurant administration
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="min-h-10 rounded-lg bg-[#294632] px-space-md py-space-sm font-body-md text-body-md font-semibold text-[#F3EBDD] hover:opacity-95"
              >
                <Tx>Sign out</Tx>
              </button>
            </form>
          </header>
          <main className="flex-1 px-space-md py-space-lg lg:px-space-xl lg:py-space-xl">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
