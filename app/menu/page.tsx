import type { Metadata } from "next";
import { CompanyGallerySection } from "@/components/menu/company-gallery-section";
import { MenuBookingCta } from "@/components/menu/menu-booking-cta";
import { MenuBreadcrumb } from "@/components/menu/menu-breadcrumb";
import { MenuDiningSection } from "@/components/menu/menu-dining-section";
import { MenuHero } from "@/components/menu/menu-hero";
import { NaturalCiderSection } from "@/components/menu/natural-cider-section";
import { TxotxExperienceSection } from "@/components/menu/txotx-experience-section";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Menu & Cider | ${siteConfig.legalName}`,
  description:
    "The sagardotegi menu at Iturrieta: traditional cider-house dining at €45, a children’s farm menu at €16, natural cider from the organic orchard, and the txotx barrel tasting.",
};

export default function MenuPage() {
  return (
    <>
      <MenuBreadcrumb />
      <MenuHero />
      <MenuDiningSection />
      <NaturalCiderSection />
      <TxotxExperienceSection />
      <CompanyGallerySection />
      <MenuBookingCta />
    </>
  );
}
