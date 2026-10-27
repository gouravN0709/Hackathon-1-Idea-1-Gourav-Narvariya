import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { StaffLoginPageContent } from "@/components/staff/staff-login-page-content";
import { SiteContainer } from "@/components/ui/site-container";
import { sanitizeStaffNextPath } from "@/lib/staff/staff-routes";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Staff sign in · ${siteConfig.legalName}`,
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

function LoginFallback() {
  return (
    <SiteContainer className="py-space-2xl">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Loading sign in…
      </p>
    </SiteContainer>
  );
}

async function StaffLoginPageInner({ searchParams }: PageProps) {
  await connection();
  const params = await searchParams;
  const nextPath = sanitizeStaffNextPath(params.next);
  return <StaffLoginPageContent nextPath={nextPath} />;
}

export default function StaffLoginPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <StaffLoginPageInner searchParams={searchParams} />
    </Suspense>
  );
}
