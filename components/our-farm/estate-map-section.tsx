import { TxServer } from "@/components/i18n/tx-server";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const places = [
  {
    title: "Orchard Terraces (Goiko Lurrak)",
    body: "Sloping southwest facing terraces receiving maximal morning sun and evening cooling winds from Gorbeia.",
  },
  {
    title: "The Underground Cellar (Upeltegia)",
    body: "Built into the hillside limestone bedrock maintaining an organic, unmanipulated cellar temperature of 10°C to 12°C all year.",
  },
  {
    title: "Open Hearth Dining Hall",
    body: "Hand-hewn timber rafters and long communal oak refectory tables surrounding the wood-fired grill (parrilla).",
  },
] as const;

const legend = [
  { label: "Farmhouse & Cellar", color: "bg-primary" },
  { label: "14 Native Cultivar Plots", color: "bg-secondary" },
  { label: "Spring Catchment", color: "bg-surface-tint" },
] as const;

export function EstateMapSection() {
  return (
    <section
      id="geography"
      className="w-full scroll-mt-24 bg-surface-container-low py-space-xl"
    >
      <SiteContainer>
        <div className="flex flex-col gap-space-lg rounded-xl bg-surface-container p-space-lg shadow-sm md:p-space-xl">
          <div className="flex flex-col justify-between gap-space-md border-b border-outline-variant/30 pb-space-md md:flex-row md:items-center">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                <TxServer>Orchard Cartography</TxServer>
              </span>
              <h2 className="font-headline-md text-headline-md font-normal text-primary">
                <TxServer>Estate Geography & Plot Layout</TxServer>
              </h2>
            </div>
            <ul className="flex flex-wrap items-center gap-x-space-md gap-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              {legend.map((item) => (
                <li key={item.label} className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="relative h-80 overflow-hidden rounded-xl shadow-inner">
                <ResponsiveImage
                  src="/images/our-farm/estate-map.png"
                  alt="Regional map of the Aramaio valley around Arrasate and the A-2620, where the farm sits in Barrio Barajuen."
                  sizes="(min-width: 1024px) 52vw, 100vw"
                />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]" />
                <p className="absolute top-4 right-4 left-4 w-fit max-w-[calc(100%-2rem)] rounded bg-surface/90 px-space-md py-space-xs font-label-sm text-label-sm tracking-wider text-primary uppercase shadow-sm backdrop-blur-md">
                  Elevation: 360m — 420m · Sloped Aspect S/SW
                </p>
                <div className="absolute right-4 bottom-4 left-4 flex flex-col gap-1 rounded bg-surface-container-lowest/90 p-space-sm font-body-sm text-body-sm text-on-surface backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <span>Coordinates: 43°03&apos;12.4&quot;N 2°34&apos;08.2&quot;W</span>
                  <span className="font-semibold text-primary">
                    <TxServer>Barrio Barajuen, Aramaio</TxServer>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-md lg:col-span-5">
              {places.map((place) => (
                <div key={place.title} className="flex flex-col gap-1">
                  <h3 className="font-title-editorial text-title-editorial font-medium text-primary">
                    {place.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {place.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
