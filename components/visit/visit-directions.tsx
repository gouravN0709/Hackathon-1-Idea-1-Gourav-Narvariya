import { Icon, type IconName } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

const routes: { from: string; duration: string; detail: string; icon: IconName }[] = [
  {
    from: "From Vitoria-Gasteiz",
    duration: "35 minutes",
    detail: "Via the A-2620 scenic mountain pass.",
    icon: "car",
  },
  {
    from: "From Bilbao",
    duration: "45 minutes",
    detail: "Via the AP-68 and N-636 toward the valley.",
    icon: "car",
  },
  {
    from: "From Donostia-San Sebastián",
    duration: "55 minutes",
    detail: "Via the AP-1 through Arrasate-Mondragón, following signs toward Aramaio.",
    icon: "car",
  },
];

export function VisitDirections() {
  return (
    <section id="directions" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer className="space-y-space-xl">
        <div className="max-w-3xl space-y-space-xs">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            Estate Sanctuary · Journey to the Valley
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
            Come Find Us in the Valley of Aramaio.
          </h2>
          <p className="pt-space-xs font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Iturrieta Sagardotegia is at Caserío Goikola in Barrio Barajuen,
            Aramaio (Álava). The drive follows mountain roads between Vitoria-Gasteiz,
            Bilbao, and Donostia-San Sebastián.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-gutter lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-space-md lg:col-span-5">
            <div className="space-y-space-md">
              {routes.map((route) => (
                <article
                  key={route.from}
                  className="rounded-xl bg-surface-container p-space-lg shadow-sm"
                >
                  <div className="flex items-start justify-between gap-space-md">
                    <div className="space-y-1">
                      <h3 className="font-label-sm text-label-sm font-semibold tracking-widest text-primary uppercase">
                        {route.from}
                      </h3>
                      <p className="font-headline-sm text-headline-sm text-on-surface">
                        {route.duration}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container text-on-primary">
                      <Icon name={route.icon} className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                    {route.detail}
                  </p>
                </article>
              ))}
            </div>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-between rounded bg-primary px-space-md py-space-md font-label-lg text-label-lg tracking-wider text-on-primary uppercase shadow-sm transition-colors hover:bg-primary-container"
            >
              Open in Google Maps
              <Icon name="external" className="h-[18px] w-[18px]" />
            </a>
          </div>

          <div className="flex flex-col rounded-xl bg-surface-container-high p-space-lg shadow-sm md:p-space-xl lg:col-span-7">
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-surface-container">
              <ResponsiveImage
                src="/images/visit/map.png"
                alt="Map view marking Caserío Goikola in Aramaio, Álava."
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center p-space-md">
                <p className="flex items-center gap-2 rounded bg-surface/95 px-space-md py-space-sm font-headline-sm text-headline-sm text-primary shadow-lg">
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary motion-safe:animate-pulse" />
                  Caserío Goikola
                </p>
              </div>
            </div>
            <div className="mt-space-lg space-y-space-md">
              <div className="space-y-space-xs">
                <h3 className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                  Exact address
                </h3>
                <p className="font-title-editorial text-title-editorial text-on-surface italic">
                  {contact.gps}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {contact.addressLines[0]}, {contact.addressLines[1]},{" "}
                  {contact.addressLines[2]}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
                <div className="flex items-start gap-space-sm rounded-lg bg-surface-container p-space-sm">
                  <Icon name="parking" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-primary">
                      Guest parking
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      On-site parking is available for diners and cellar guests,
                      including EV chargers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm rounded-lg bg-surface-container p-space-sm">
                  <Icon name="bolt" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-label-sm text-label-sm font-semibold text-primary">
                      EV charging
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      EV chargers are available with guest parking. Charger type
                      and availability are confirmed by the farm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
