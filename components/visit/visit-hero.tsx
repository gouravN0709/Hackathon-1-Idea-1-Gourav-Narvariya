import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { diningHours } from "@/lib/site-config";

const facts = [
  {
    label: "Cider season",
    value: "Jan 15 – May 18",
    detail: "Txotx dates published on this site",
  },
  {
    label: "Service window",
    value: diningHours.openDaysShort,
    detail: `${diningHours.hours} midday`,
  },
  {
    label: "Estate territory",
    value: "Barrio Barajuen",
    detail: "Aramaio Valley, Álava",
  },
  {
    label: "Seating",
    value: "Reservations",
    detail: "Strongly recommended",
  },
] as const;

export function VisitHero() {
  return (
    <section className="relative w-full overflow-hidden bg-primary text-on-primary">
      <div className="relative flex min-h-[640px] items-end pb-space-2xl md:min-h-[720px]">
        <div className="absolute inset-0">
          <ResponsiveImage
            src="/images/visit/hero.jpg"
            alt="Caserío Goikola, a stone Basque farmhouse among apple orchards in the misty Aramaio valley."
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/25" />
        </div>
        <SiteContainer className="relative z-10 pt-space-2xl">
          <div className="max-w-3xl space-y-space-md">
            <p className="inline-flex items-center gap-2 rounded bg-surface/15 px-space-md py-space-xs font-label-sm text-label-sm tracking-widest text-tertiary-fixed uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-fixed" />
              Aramaio Valley · Estate Sanctuary
            </p>
            <h1 className="font-display-hero text-display-hero-mobile leading-[1.08] font-light tracking-tight text-balance text-surface md:text-[68px]">
              Your Table Awaits in the Basque Country.
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg font-light text-surface-container-high/90">
              Experience the living rhythm of our family cider house in the
              secluded valley of Aramaio. Gather around long tables, taste fresh
              cider straight from ancestral barrels, and enjoy Basque farmhouse
              cooking.
            </p>
            <div className="flex flex-col gap-space-md pt-space-sm sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#contact"
                className="inline-flex min-h-11 items-center justify-center rounded bg-secondary px-space-xl py-space-md font-label-lg text-label-lg tracking-widest text-surface uppercase shadow-md transition-colors hover:bg-on-secondary-container"
              >
                Plan a visit
              </a>
              <a
                href="#directions"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-surface/10 px-space-xl py-space-md font-label-lg text-label-lg tracking-widest text-surface uppercase backdrop-blur-sm transition-colors hover:bg-surface/20"
              >
                <Icon name="map-pin" className="h-[18px] w-[18px]" />
                Get directions
              </a>
            </div>
          </div>
          <dl className="mt-space-2xl grid grid-cols-1 gap-gutter rounded bg-surface-container-lowest/10 p-space-lg text-surface backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="space-y-1">
                <dt className="font-label-sm text-label-sm tracking-widest text-secondary-fixed uppercase">
                  {fact.label}
                </dt>
                <dd className="font-headline-sm text-headline-sm font-light text-surface-bright">
                  {fact.value}
                </dd>
                <dd className="font-body-sm text-body-sm text-surface-dim">
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </SiteContainer>
      </div>
    </section>
  );
}
