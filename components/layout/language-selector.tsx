"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSelector({ className }: { className?: string }) {
  const t = useTranslations("languages");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={cn("relative shrink-0", className)}>
      <label htmlFor="site-language" className="sr-only">
        {t("switchAria")}
      </label>
      <select
        id="site-language"
        value={locale}
        aria-label={t("switchAria")}
        className="min-h-11 max-w-[10rem] cursor-pointer appearance-none rounded-lg border border-outline-variant/40 bg-surface-container-low py-2 pr-8 pl-3 font-label-sm text-label-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          if (!locales.includes(next) || next === locale) {
            return;
          }
          router.replace(pathname, { locale: next });
        }}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
