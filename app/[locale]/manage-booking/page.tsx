import type { Metadata } from "next";
import { ManageBookingPanel } from "@/components/manage-booking/manage-booking-panel";
import { ManageSupport } from "@/components/manage-booking/manage-support";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { contact, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Manage Your Booking | ${siteConfig.legalName}`,
  description:
    "Look up an Iturrieta reservation with your reference and contact details, and cancel eligible bookings online.",
};

export default function ManageBookingPage() {
  return (
    <>
      <PageBreadcrumb
        current="Manage Your Booking · Erreserba Kudeatu"
        note={contact.phoneDisplay}
      />
      <ManageBookingPanel />
      <ManageSupport />
    </>
  );
}
