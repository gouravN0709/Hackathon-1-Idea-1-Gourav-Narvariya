import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

export function VisitSection() {
  return (
    <section id="visit" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-stretch gap-gutter rounded-xl bg-surface-container p-space-lg shadow-md md:p-space-xl lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-space-lg lg:col-span-7">
            <div className="flex flex-col gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                  Travel Concierge
                </span>
                <h2 className="mt-1 font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
                  Plan your valley arrival.
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-space-lg pt-space-xs sm:grid-cols-2">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm font-bold tracking-wider text-secondary uppercase">
                    Location & Address
                  </span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    {contact.addressLines[0]}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {contact.addressLines[1]}
                    <br />
                    {contact.addressLines[2]}
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm font-bold tracking-wider text-secondary uppercase">
                    Txotx Season Dining
                  </span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    January 15 – May 18
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Fridays: 20:30 – 00:00
                    <br />
                    Saturdays: 13:30 – 17:00 & 20:30 – 00:00
                    <br />
                    Sundays: 13:30 – 17:30
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm font-bold tracking-wider text-secondary uppercase">
                    Cellar Boutique & Walks
                  </span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    Open Year-Round
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Tuesday – Sunday: 10:00 – 19:00
                    <br />
                    Bottle sales & orchard walks
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm font-bold tracking-wider text-secondary uppercase">
                    Proximity & Transit
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    • 35 min from Vitoria-Gasteiz (A-2620)
                    <br />
                    • 45 min from Bilbao (AP-68 / N-636)
                    <br />
                    • 55 min from Donostia-San Sebastián
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-md pt-space-md">
              <a
                href={contact.phoneHref}
                className="flex min-h-11 items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant"
              >
                <Icon name="phone" className="h-[18px] w-[18px] text-secondary" />
                {contact.phoneDisplay}
              </a>
              <span className="font-light text-outline-variant">·</span>
              <a
                href={`mailto:${contact.email}`}
                className="flex min-h-11 items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant"
              >
                <Icon name="mail" className="h-[18px] w-[18px] text-secondary" />
                {contact.email}
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg bg-surface p-space-md shadow-inner lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-surface-container-high shadow-sm">
              <ResponsiveImage
                src="/images/visit-map.jpg"
                alt="Map-style view of the Goikola estate in Aramaio, Álava."
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-primary/20" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-surface/90 px-space-sm py-1 font-label-sm text-label-sm text-primary backdrop-blur-md">
                <Icon name="map-pin" className="h-3.5 w-3.5 text-secondary" />
                <span>Goikola Estate, Aramaio</span>
              </div>
            </div>
            <div className="mt-space-md flex flex-col gap-space-sm rounded bg-surface-container-low p-space-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="parking" className="h-5 w-5 shrink-0 text-secondary" />
                <span className="font-body-sm text-body-sm text-on-surface">
                  Private Guest Parking & EV Chargers Available
                </span>
              </div>
              <ButtonLink href={contact.mapsUrl} variant="underline" external className="shrink-0">
                Directions
                <Icon name="external" className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
