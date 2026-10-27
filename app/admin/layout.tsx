import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const instant = false;

export const metadata: Metadata = {
  title: `Admin · ${siteConfig.legalName}`,
  description: "Restaurant administration for Iturrieta Sagardotegia.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
