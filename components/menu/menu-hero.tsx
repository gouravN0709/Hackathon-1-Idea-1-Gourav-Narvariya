import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const highlights = [
  { value: "€45", label: "Adult Traditional Menu", tone: "primary" },
  { value: "€16", label: "Children's Farm Menu", tone: "primary" },
  { value: "Txotx", label: "Unlimited Barrel Pours", tone: "secondary" },
  { value: "100%", label: "Organic Native Apples", tone: "primary" },
] as const;

export function MenuHero() {
  return (
    <section className="relative w-full overflow-hidden pt-space-xl pb-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-lg lg:col-span-7">
            <p className="flex items-center gap-space-sm font-label-sm text-label-sm tracking-[0.2em] text-secondary uppercase">
              <span className="h-px w-8 bg-secondary/60" />
              Sagardotegi Gastronomy & Cellar Traditions
            </p>
            <h1 className="font-display-hero text-display-hero-mobile leading-[1.08] font-normal tracking-tight text-balance text-primary sm:text-display-hero">
              A Taste of
              <br />
              <span className="font-normal text-secondary italic">Our Land.</span>
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              Generations of Basque farmhouse gastronomy centered around our
              wood-fired hearth, wild-fermented sagardoa poured directly from
              giant kupelak, and unhurried fellowship at long communal tables.
            </p>
            <div className="flex flex-col items-stretch gap-space-sm pt-space-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-space-md">
              <ButtonLink href="/book" variant="primary" className="gap-space-xs">
                Book a Visit
                <Icon name="calendar" className="h-[18px] w-[18px]" />
              </ButtonLink>
              <Link
                href="#tasting-menus"
                className="inline-flex min-h-11 items-center justify-center gap-space-xs px-space-md py-3 font-label-lg text-label-lg text-secondary transition-colors hover:text-primary"
              >
                Explore the Tasting Menus
                <Icon name="arrow-down" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-space-sm pt-space-md sm:grid-cols-4">
              {highlights.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col rounded-lg bg-surface-container p-space-sm"
                >
                  <span
                    className={
                      item.tone === "secondary"
                        ? "font-headline-sm text-headline-sm font-medium text-secondary"
                        : "font-headline-sm text-headline-sm font-medium text-primary"
                    }
                  >
                    {item.value}
                  </span>
                  <span className="mt-1 font-label-sm text-label-sm text-on-surface-variant uppercase">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-space-lg lg:col-span-5 lg:mt-0">
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-container-high shadow-xl">
              <ResponsiveImage
                src="/images/menu/hero-table.jpg"
                alt="Candlelit oak table in the cider house, with a glass of sagardoa beside a txuleton in a cast-iron skillet."
                sizes="(min-width: 1024px) 42vw, 100vw"
                priority
                className="transition-transform duration-700 motion-safe:group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              <div className="absolute right-space-md bottom-space-md left-space-md flex items-center justify-between gap-space-sm text-surface">
                <div className="min-w-0">
                  <p className="font-label-sm text-label-sm tracking-widest text-secondary-fixed uppercase">
                    Caserío Goikola
                  </p>
                  <p className="font-headline-sm text-headline-sm font-normal text-surface">
                    Txotx & Table Hospitality
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface/20 text-surface backdrop-blur-md">
                  <Icon name="hearth" className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 hidden max-w-[260px] flex-col gap-1 rounded-lg bg-surface-container-lowest p-space-md shadow-lg sm:flex lg:-left-8">
              <div className="flex items-center gap-1 text-secondary">
                <Icon name="verified" className="h-[18px] w-[18px]" />
                <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                  Slow Craft Food
                </span>
              </div>
              <p className="font-body-sm text-body-sm leading-snug text-on-surface-variant">
                Every course prepared live over aged applewood coals and vine
                cuttings.
              </p>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
