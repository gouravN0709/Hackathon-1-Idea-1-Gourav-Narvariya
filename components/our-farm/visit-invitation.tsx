import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

export function VisitInvitation() {
  return (
    <section className="relative w-full overflow-hidden bg-primary py-space-2xl text-on-primary">
      <div className="absolute inset-0 opacity-25">
        <ResponsiveImage
          src="/images/our-farm/cta-dusk.jpg"
          alt=""
          sizes="100vw"
          className="object-center"
        />
      </div>
      <SiteContainer className="relative z-10 flex flex-col items-center gap-space-lg text-center">
        <div className="flex max-w-2xl flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary-fixed uppercase">
            Hospitality in the Valley
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-surface-container-lowest md:text-headline-lg">
            Experience the rhythm of our farm.
          </h2>
          <p className="mt-space-xs font-body-lg text-body-lg font-light text-surface-container-highest/90">
            We open our doors and cellars during txotx season and year-round for
            guided orchard walks, barrel tastings, and authentic farmhouse dining.
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch justify-center gap-space-md sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink href="/book" variant="hero" className="w-full sm:w-auto">
            Book a Visit & Table
          </ButtonLink>
          <ButtonLink href="/#menu" variant="glass" className="w-full sm:w-auto">
            Explore Our Cider
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="flex flex-col items-center gap-space-sm border-t border-outline/30 pt-space-md text-center font-body-sm text-body-sm text-surface-container-highest/80 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-space-md">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="map-pin" className="h-[18px] w-[18px] text-secondary-fixed" />
            Barrio Barajuen, Aramaio Valley, Álava
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>45 min from Bilbao & Donostia-San Sebastián</span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <a href={contact.phoneHref} className="underline-offset-4 hover:underline">
            {contact.phoneDisplay}
          </a>
        </div>
      </SiteContainer>
    </section>
  );
}
