"use client";

import { useMessages, useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { Link } from "@/i18n/navigation";
import { getContentMessages } from "@/lib/i18n/content";
import { contact } from "@/lib/site-config";

export function SiteFooter() {
  const t = useTranslations("layout.footer");
  const messages = useMessages();
  const { siteConfig, footerEstateLinks } = getContentMessages(messages);

  return (
    <footer className="mt-space-2xl w-full bg-surface-container-low shadow-[0_-1px_12px_rgba(41,70,50,0.03)]">
      <SiteContainer className="pt-space-2xl pb-space-xl">
        <div className="grid grid-cols-1 gap-gutter pb-space-2xl md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-5">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary">
                {siteConfig.legalName}
              </span>
              <span className="mt-space-xs font-label-sm text-label-sm tracking-widest text-secondary uppercase">
                {t("estateLine")}
              </span>
            </div>
            <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
              {t("blurb")}
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <span className="inline-flex items-center rounded bg-tertiary-fixed px-space-sm py-space-xs font-label-sm text-label-sm tracking-wider text-primary uppercase">
                {t("badgeDop")}
              </span>
              <span className="inline-flex items-center rounded bg-tertiary-fixed px-space-sm py-space-xs font-label-sm text-label-sm tracking-wider text-primary uppercase">
                {t("badgeOrganic")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm lg:col-span-3">
            <span className="mb-space-xs font-label-lg text-label-lg font-semibold tracking-widest text-primary uppercase">
              {t("estateNavTitle")}
            </span>
            <nav className="flex flex-col gap-space-sm" aria-label={t("estateNavTitle")}>
              {footerEstateLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-body-md text-body-md text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-space-md rounded-xl bg-surface-container p-space-lg lg:col-span-4">
            <span className="font-label-lg text-label-lg font-semibold tracking-widest text-primary uppercase">
              {t("reachingTitle")}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t("reachingBody")}
            </p>
            <div className="flex flex-col gap-space-xs pt-space-xs">
              <span className="font-label-sm text-label-sm font-semibold text-secondary uppercase">
                {t("gpsLabel")}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">
                {contact.gps}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {contact.infoEmail} · {contact.phoneDisplay}
              </span>
            </div>
            <div className="pt-space-xs">
              <ButtonLink href="/visit" variant="underline">
                {t("directionsCta")}
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-md pt-space-lg sm:flex-row">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t("copyright", { legalName: siteConfig.legalName })}
          </span>
          <div className="flex items-center gap-space-lg">
            <Link
              href="/legal"
              className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {t("privacyLink")}
            </Link>
            <Link
              href="/legal"
              className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {t("termsLink")}
            </Link>
            <Link
              href="/#visit"
              className="font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {t("pressLink")}
            </Link>
          </div>
        </div>
      </SiteContainer>
    </footer>
  );
}
