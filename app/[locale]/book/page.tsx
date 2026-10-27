import type { Metadata } from "next";
import { Suspense } from "react";
import { BookPageContent, BookPageFallback } from "@/components/book/book-page-content";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Book a Visit | ${siteConfig.legalName}`,
  description:
    "Prepare or submit a midday table request for Iturrieta Sagardotegia. Live submission requires a configured reservation database; otherwise the form is preview-only.",
};

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageFallback />}>
      <BookPageContent />
    </Suspense>
  );
}
