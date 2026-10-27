"use client";

import { useMessages, useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { LanguageSelector } from "@/components/layout/language-selector";
import { Icon } from "@/components/ui/icon";
import { Link, usePathname } from "@/i18n/navigation";
import { getContentMessages } from "@/lib/i18n/content";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const tLayout = useTranslations("layout");
  const tHeader = useTranslations("layout.header");
  const messages = useMessages();
  const { siteConfig, navItems } = getContentMessages(messages);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-container-high"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        <span className="sr-only">
          {open ? tLayout("mobile.closeMenu") : tLayout("mobile.openMenu")}
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label={tLayout("mobile.closeMenu")}
            className="fixed inset-0 top-20 z-30 bg-primary/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-20 z-40 border-t border-primary/10 bg-surface shadow-[0_12px_32px_-4px_rgba(41,70,50,0.08)]">
            <nav
              id={panelId}
              aria-label={tLayout("mobile.mobileNavAria")}
              className="mx-auto flex max-w-[1280px] flex-col gap-1 px-margin-mobile py-space-md md:px-margin-tablet"
            >
              <LanguageSelector className="mb-space-sm sm:hidden" />
              {navItems.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  aria-current={
                    !item.href.includes("#") &&
                    (pathname === item.href || pathname.startsWith(`${item.href}/`))
                      ? "page"
                      : undefined
                  }
                  className="min-h-11 py-space-sm font-body-md text-body-md text-on-surface-variant transition-colors hover:text-on-surface aria-[current=page]:font-semibold aria-[current=page]:text-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/book"
                className="mt-space-sm inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-container px-space-lg py-space-sm font-label-lg text-label-lg uppercase tracking-wider text-surface transition-colors hover:bg-primary"
                onClick={() => setOpen(false)}
              >
                {tHeader("bookCta")}
              </Link>
              <p className="pt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                {siteConfig.tagline}
              </p>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
