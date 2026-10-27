import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { sanitizeAdminNextPath } from "@/lib/admin/admin-routes";
import { adminAccessFromStaffAccess } from "@/lib/admin/require-admin-access";
import { getStaffAccess } from "@/lib/staff/get-staff-access";
import { hasPublishableSupabaseConfiguration } from "@/lib/staff/supabase-config";
import { siteConfig } from "@/lib/site-config";
import { redirect } from "next/navigation";

export const instant = false;

export const metadata: Metadata = {
  title: `Admin sign in · ${siteConfig.legalName}`,
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  await connection();
  const params = await searchParams;
  const nextPath = sanitizeAdminNextPath(params.next);
  const configured = hasPublishableSupabaseConfiguration();

  if (configured) {
    const access = await getStaffAccess();
    const adminGate = adminAccessFromStaffAccess(access);
    if (adminGate.ok) {
      redirect(nextPath);
    }
  }

  return (
    <div className="min-h-screen bg-[#D8DCCB]">
      {!configured ? (
        <div className="mx-auto max-w-md px-space-md pt-space-xl">
          <p className="rounded-lg bg-error-container px-space-md py-space-sm text-on-error-container">
            Supabase publishable credentials are not configured. Admin sign-in is
            unavailable.
          </p>
        </div>
      ) : null}
      <AdminLoginForm nextPath={nextPath} disabled={!configured} />
    </div>
  );
}
