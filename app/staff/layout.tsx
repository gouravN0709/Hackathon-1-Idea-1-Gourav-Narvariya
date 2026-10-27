import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const instant = false;

export const metadata: Metadata = {
  title: `Staff · ${siteConfig.legalName}`,
  description:
    "Internal reservation tools for Iturrieta staff. Not indexed for public search.",
  robots: { index: false, follow: false },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
