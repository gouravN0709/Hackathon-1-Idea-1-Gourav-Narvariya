import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffReservationsPageContent } from "@/components/staff/staff-reservations-page-content";
import { SiteContainer } from "@/components/ui/site-container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Staff reservations · ${siteConfig.legalName}`,
  description:
    "Protected staff reservation list. Requires sign-in and an active staff profile.",
};

type PageProps = {
  searchParams: Promise<{
    date?: string;
    status?: string;
    reference?: string;
  }>;
};

function ReservationsFallback() {
  return (
    <SiteContainer className="py-space-2xl">
      <p className="font-body-md text-body-md text-on-surface-variant">
        Loading staff reservations…
      </p>
    </SiteContainer>
  );
}

export default function StaffReservationsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ReservationsFallback />}>
      <StaffReservationsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
