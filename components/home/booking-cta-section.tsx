import type { ReactNode } from "react";
import { TxServer } from "@/components/i18n/tx-server";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

type BookingCtaSectionProps = {
  bookingNote?: ReactNode;
};

export function BookingCtaSection({ bookingNote }: BookingCtaSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-space-2xl text-surface">
      <div className="absolute inset-0">
        <ResponsiveImage
          src="/images/cta-dusk.jpg"
          alt=""
          sizes="100vw"
          className="opacity-25 mix-blend-overlay"
        />
      </div>
      <SiteContainer className="relative flex flex-col items-center gap-space-lg py-space-xl text-center">
        <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary-fixed-dim uppercase">
          <TxServer>Your Table Is Waiting</TxServer>
        </span>
        <h2 className="font-display-hero text-display-hero-mobile md:text-display-hero max-w-3xl leading-tight font-normal">
          <TxServer>Come for the cider.</TxServer>
          <br />
          <span className="font-display-hero text-surface-container-high italic">
            <TxServer>Stay for the experience.</TxServer>
          </span>
        </h2>
        <p className="max-w-xl font-body-lg text-body-lg font-light text-surface-container-high">
          Due to our intimate cellar capacity and traditional barrel service,
          reservations for txotx season seatings and guided harvest visits are
          strongly recommended in advance.
        </p>
        {bookingNote ? (
          <p className="max-w-xl font-body-sm text-body-sm text-surface-container-low">
            {bookingNote}
          </p>
        ) : null}
        <div className="flex flex-col items-center gap-space-md pt-space-sm sm:flex-row">
          <ButtonLink href="/book" variant="hero" className="px-space-2xl shadow-lg">
            <TxServer>Book Your Visit</TxServer>
          </ButtonLink>
          <ButtonLink
            href="/#menu"
            variant="ghost"
            className="underline decoration-surface-container-high/40 underline-offset-4"
          >
            <TxServer>Explore Bottled Cuvees & Shop</TxServer>
          </ButtonLink>
        </div>
        <div className="flex flex-col items-center gap-space-md pt-space-md font-body-sm text-body-sm text-surface-container-low sm:flex-row sm:gap-space-lg">
          <span className="flex items-center gap-1">
            <Icon name="verified" className="h-4 w-4 text-secondary-fixed-dim" />
            <TxServer>Authentic Basque Hospitality</TxServer>
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <Icon name="eco" className="h-4 w-4 text-secondary-fixed-dim" />
            100% Organic & Biodynamic
          </span>
        </div>
      </SiteContainer>
    </section>
  );
}
