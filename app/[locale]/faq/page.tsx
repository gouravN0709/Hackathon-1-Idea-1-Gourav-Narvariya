import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqHelp } from "@/components/faq/faq-help";
import { FaqHero } from "@/components/faq/faq-hero";
import {
  FaqTopicsFallback,
  FaqTopicsWithReadiness,
} from "@/components/faq/faq-topics-with-readiness";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { diningHours, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `FAQ | ${siteConfig.legalName}`,
  description: `Questions about visiting Iturrieta Sagardotegia: hours (${diningHours.openDaysShort}, ${diningHours.hours}), the txotx season, the menu, and online booking when it is live.`,
};

export default function FaqPage() {
  return (
    <>
      <PageBreadcrumb
        current="Frequently Asked Questions · Galdera Arruntak"
        note={`${diningHours.openDaysShort} · ${diningHours.hours}`}
      />
      <FaqHero />
      <Suspense fallback={<FaqTopicsFallback />}>
        <FaqTopicsWithReadiness />
      </Suspense>
      <FaqHelp />
    </>
  );
}
