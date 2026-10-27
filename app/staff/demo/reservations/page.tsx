import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffDemoReservationsPageContent } from "@/components/staff/staff-demo-reservations-page-content";
import { SiteContainer } from "@/components/ui/site-container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Staff demo reservations · ${siteConfig.legalName}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    reference?: string;
  }>;
};

function DemoFallback() {
  return (
    <SiteContainer className="py-space-2xl">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Loading demo…
      </p>
    </SiteContainer>
  );
}

export default function StaffDemoReservationsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<DemoFallback />}>
      <StaffDemoReservationsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
