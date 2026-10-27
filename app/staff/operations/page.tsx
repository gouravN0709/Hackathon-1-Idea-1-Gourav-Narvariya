import type { Metadata } from "next";
import { Suspense } from "react";
import {
  StaffOperationsFallback,
  StaffOperationsPageContent,
} from "@/components/staff/staff-operations-page-content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Staff operations · ${siteConfig.legalName}`,
  description:
    "Manage service shifts, special closures, and dining tables. Requires an owner or manager staff profile.",
};

export default function StaffOperationsPage() {
  return (
    <Suspense fallback={<StaffOperationsFallback />}>
      <StaffOperationsPageContent />
    </Suspense>
  );
}
