"use client";

import { useMessages, useTranslations } from "next-intl";
import { LanguageSelector } from "@/components/layout/language-selector";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { Link, usePathname } from "@/i18n/navigation";
import { getContentMessages } from "@/lib/i18n/content";

function isCurrentPage(href: string, pathname: string) {
  if (href.includes("#")) {
    return false;
  }
  const normalized = href.startsWith("/") ? href : `/${href}`;
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("layout.header");
  const messages = useMessages();
  const { siteConfig, navItems } = getContentMessages(messages);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(41,70,50,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-gutter px-margin-mobile md:px-margin-tablet lg:px-margin">
        <Link href="/" className="group flex flex-col text-left">
          <span className="font-title-editorial text-title-editorial font-medium tracking-tight text-primary transition-colors group-hover:text-primary-container">
            {siteConfig.name}
          </span>
          <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
            {siteConfig.descriptor}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-space-lg xl:flex"
          aria-label={t("primaryNavAria")}
        >
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={isCurrentPage(item.href, pathname) ? "page" : undefined}
              className={
                isCurrentPage(item.href, pathname)
                  ? "border-b border-secondary pb-1 font-semibold text-primary transition-colors"
                  : "font-body-md text-body-md text-on-surface-variant transition-colors hover:text-on-surface"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-space-md">
          <LanguageSelector className="hidden sm:block" />
          <ButtonLink
            href="/book"
            variant="primary"
            className="max-sm:hidden whitespace-nowrap"
          >
            {t("bookCta")}
          </ButtonLink>
          <MobileNavigation />
        </div>
      </div>
    </header>
  );
}
