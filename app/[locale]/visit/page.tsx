import type { Metadata } from "next";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { VisitContact } from "@/components/visit/visit-contact";
import { VisitCta } from "@/components/visit/visit-cta";
import { VisitDirections } from "@/components/visit/visit-directions";
import { VisitFaq } from "@/components/visit/visit-faq";
import { VisitHero } from "@/components/visit/visit-hero";
import { VisitHours } from "@/components/visit/visit-hours";
import { VisitSeason } from "@/components/visit/visit-season";
import { diningHours, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Visit Us | ${siteConfig.legalName}`,
  description: `Find Iturrieta Sagardotegia at Caserío Goikola in Aramaio. Midday service is ${diningHours.openDays}, ${diningHours.hours}. ${diningHours.closedDays} the cider house is closed.`,
};

export default function VisitPage() {
  return (
    <>
      <PageBreadcrumb
        current="Visit Us · Aramaio Valley"
        note="Thursday – Sunday · 13:00 – 16:00"
      />
      <VisitHero />
      <VisitDirections />
      <VisitHours />
      <VisitSeason />
      <VisitContact />
      <VisitFaq />
      <VisitCta />
    </>
  );
}
