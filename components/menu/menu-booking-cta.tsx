import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

export function MenuBookingCta() {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-space-2xl text-surface">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-container/40 via-transparent to-black/30" />
      <SiteContainer className="relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-space-md rounded-2xl bg-primary-container/80 p-space-lg text-center shadow-2xl backdrop-blur-md md:p-space-2xl">
          <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary-fixed uppercase">
            <TxServer>Reservations & Hospitality</TxServer>
          </span>
          <h2 className="font-display-hero text-display-hero-mobile leading-[1.1] font-normal tracking-tight text-balance text-surface sm:text-display-hero">
            <TxServer>Come Hungry.</TxServer>
            <br />
            <span className="font-normal text-secondary-fixed italic">
              <TxServer>Leave with a Story.</TxServer>
            </span>
          </h2>
          <p className="max-w-2xl font-body-lg text-body-lg text-on-primary-container">
            Our cellar doors open for txotx season and year-round for guided
            walks, tastings, and farmhouse dining. Reservations are recommended
            to preserve the unhurried, intimate farmhouse atmosphere.
          </p>
          <div className="flex flex-col items-stretch justify-center gap-space-sm pt-space-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-space-md">
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-secondary-fixed px-space-xl py-3.5 font-label-lg text-label-lg tracking-wider text-on-secondary-fixed uppercase shadow-lg transition-colors hover:bg-secondary-fixed-dim"
            >
              Book a Visit
            </Link>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex min-h-11 items-center justify-center gap-space-xs px-space-lg py-3.5 font-label-lg text-label-lg tracking-wider text-surface uppercase transition-colors hover:text-secondary-fixed"
            >
              <Icon name="mail" className="h-[18px] w-[18px]" />
              <TxServer>Contact Farm Concierge</TxServer>
            </a>
          </div>
          <div className="mt-space-sm flex w-full flex-col items-center justify-center gap-space-md border-t border-surface/10 pt-space-md font-body-sm text-body-sm text-on-primary-container sm:flex-row">
            <p className="flex items-start justify-center gap-space-xs text-balance sm:items-center">
              <Icon name="clock" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-secondary-fixed sm:mt-0" />
              <span>
                Txotx season 15 Jan – 18 May · Fri 20:30–00:00 · Sat 13:30–17:00
                & 20:30–00:00 · Sun 13:30–17:30
              </span>
            </p>
            <span className="hidden opacity-30 sm:inline" aria-hidden="true">
              •
            </span>
            <p className="flex items-center gap-space-xs">
              <Icon name="map-pin" className="h-[18px] w-[18px] shrink-0 text-secondary-fixed" />
              <span><TxServer>Barrio Barajuen, Aramaio Valley, Álava</TxServer></span>
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
