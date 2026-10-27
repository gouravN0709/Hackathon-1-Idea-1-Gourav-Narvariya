import { defineRouting } from "next-intl/routing";

export const locales = ["en", "es", "eu"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "always",
});

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  eu: "Euskara",
};
