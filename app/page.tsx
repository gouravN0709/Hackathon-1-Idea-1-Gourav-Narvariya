import { Suspense } from "react";
import {
  BookingCtaFallback,
  BookingCtaWithReadiness,
} from "@/components/home/booking-cta-with-readiness";
import { ExperiencesSection } from "@/components/home/experiences-section";
import { FarmStorySection } from "@/components/home/farm-story-section";
import { GallerySection } from "@/components/home/gallery-section";
import { HeroSection } from "@/components/home/hero-section";
import { MenuSection } from "@/components/home/menu-section";
import { OrchardSection } from "@/components/home/orchard-section";
import { TxotxSection } from "@/components/home/txotx-section";
import { VisitSection } from "@/components/home/visit-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FarmStorySection />
      <OrchardSection />
      <TxotxSection />
      <MenuSection />
      <ExperiencesSection />
      <GallerySection />
      <VisitSection />
      <Suspense fallback={<BookingCtaFallback />}>
        <BookingCtaWithReadiness />
      </Suspense>
    </>
  );
}
