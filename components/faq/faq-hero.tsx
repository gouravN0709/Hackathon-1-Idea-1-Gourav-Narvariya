import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { diningHours, menuPrices, txotxSeasonLabel } from "@/lib/site-config";

const chips = [
  { icon: "calendar" as const, label: `Txotx season: ${txotxSeasonLabel}` },
  { icon: "clock" as const, label: `${diningHours.openDaysShort} ${diningHours.hours}` },
  { icon: "restaurant" as const, label: `Tasting menu: €${menuPrices.adult}` },
];

export function FaqHero() {
  return (
    <section className="relative w-full overflow-hidden bg-surface py-space-xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-secondary" />
              <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                Here to help
              </p>
            </div>
            <h1 className="max-w-2xl font-headline-lg text-headline-lg-mobile leading-tight text-primary md:text-headline-lg">
              A Few Things You Might Like to Know.
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              Guidance for seasonal farmhouse dining, the cellar tasting, harvest
              timing, and the drive to Caserío Goikola in the Aramaio valley.
            </p>
            <ul className="flex flex-wrap gap-space-md pt-space-xs">
              {chips.map((chip) => (
                <li
                  key={chip.label}
                  className="flex items-center gap-2 rounded-lg bg-surface-container px-space-md py-space-xs font-label-sm text-label-sm text-primary"
                >
                  <Icon name={chip.icon} className="h-4 w-4 text-secondary" />
                  {chip.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mt-space-md lg:col-span-5 lg:mt-0">
            <div className="relative h-80 overflow-hidden rounded-xl bg-surface-container-high shadow-xl lg:h-96">
              <ResponsiveImage
                src="/images/faq/cellar.jpg"
                alt="Sunlight in the stone cellar at Iturrieta, with chestnut cider casks and a communal oak table."
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/70 via-transparent to-transparent p-space-lg text-on-primary">
                <p className="font-label-sm text-label-sm tracking-wider text-secondary-fixed uppercase">
                  Caserío Goikola · Barajuen
                </p>
                <p className="font-title-editorial text-title-editorial italic">
                  “Beti ateak zabalik lagun artean.”
                </p>
              </div>
            </div>
            <p className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-lg border-l-4 border-secondary bg-surface-container-lowest p-space-md font-body-sm text-body-sm text-on-surface shadow-md sm:block">
              Fresh cider flows straight from the wood. These answers use the
              hours, prices, and contacts published on this site.
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
