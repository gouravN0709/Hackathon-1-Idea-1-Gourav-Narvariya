import type { Metadata } from "next";
import { EstateMapSection } from "@/components/our-farm/estate-map-section";
import { FamilySection } from "@/components/our-farm/family-section";
import { FarmBreadcrumb } from "@/components/our-farm/farm-breadcrumb";
import { FarmHero } from "@/components/our-farm/farm-hero";
import { HeritageSection } from "@/components/our-farm/heritage-section";
import { OrchardChapter } from "@/components/our-farm/orchard-chapter";
import { ProcessSection } from "@/components/our-farm/process-section";
import { TraditionsSection } from "@/components/our-farm/traditions-section";
import { VisitInvitation } from "@/components/our-farm/visit-invitation";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Our Farm | ${siteConfig.legalName}`,
  description:
    "The family farm behind Iturrieta Sagardotegia: organic Basque apple orchards in the Aramaio Valley, wild cider fermentation, and the txotx tradition.",
};

export default function OurFarmPage() {
  return (
    <>
      <FarmBreadcrumb />
      <FarmHero />
      <HeritageSection />
      <OrchardChapter />
      <ProcessSection />
      <TraditionsSection />
      <FamilySection />
      <EstateMapSection />
      <VisitInvitation />
    </>
  );
}
