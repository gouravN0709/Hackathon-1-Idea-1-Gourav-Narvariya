import { TxServer } from "@/components/i18n/tx-server";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const stats = [
  { value: "1998", label: "Founded by Family" },
  { value: "~1,400", label: "Organic Apple Trees" },
  { value: "14", label: "Native Basque Cultivars" },
  { value: "100%", label: "Wild Native Ferment" },
] as const;

export function FarmHero() {
  return (
    <section className="relative w-full overflow-hidden bg-primary text-on-primary">
      <div className="relative flex min-h-[34rem] items-end sm:min-h-[620px] lg:min-h-[740px]">
        <div className="absolute inset-0">
          <ResponsiveImage
            src="/images/our-farm/hero.jpg"
            alt="Stone farmhouse of Iturrieta among hillside apple trees, with mist in the Aramaio valley and limestone peaks beyond."
            sizes="100vw"
            priority
            className="object-[70%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/30 to-transparent" />
        </div>

        <SiteContainer className="relative z-10 pt-space-2xl pb-space-xl">
          <div className="flex max-w-3xl flex-col gap-space-md">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="max-w-full rounded bg-tertiary-container/80 px-space-md py-1 text-center font-label-sm text-label-sm tracking-[0.14em] text-secondary-fixed uppercase text-balance backdrop-blur-sm sm:tracking-[0.2em]">
                Aramaio Valley · Álava · Est.{"\u00A0"}1998
              </span>
              <span className="hidden items-center gap-1 font-label-sm text-label-sm tracking-wider text-primary-fixed-dim uppercase md:inline-flex">
                <Icon name="eco" className="h-3.5 w-3.5" />
                <TxServer>Euskal Sagardoa DOP</TxServer>
              </span>
            </div>
            <h1 className="font-display-hero text-display-hero-mobile leading-[1.15] font-normal tracking-tight text-balance text-surface-container-lowest md:text-[68px] md:leading-[1.1]">
              <TxServer>Rooted in Our Land.</TxServer>
              <br />
              <em className="font-display-hero text-secondary-fixed italic">
                <TxServer>Made by Our Family.</TxServer>
              </em>
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg font-light text-surface-container-highest/90">
              Generations of quiet devotion to native apple trees, natural wild
              fermentation, and ancestral hospitality nestled deep in the
              limestone amphitheater of Mount Anboto.
            </p>
            <div className="flex flex-col items-stretch gap-space-md pt-space-sm sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href="/book" variant="hero" className="w-full sm:w-auto">
                <TxServer>Book an Estate Visit</TxServer>
              </ButtonLink>
              <ButtonLink
                href="/#menu"
                variant="glass"
                className="w-full sm:w-auto"
              >
                <TxServer>Explore Our Cider</TxServer>
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </SiteContainer>
      </div>

      <div className="w-full bg-tertiary py-space-md text-on-tertiary shadow-inner">
        <SiteContainer>
          <ul className="grid grid-cols-2 items-start gap-x-gutter gap-y-space-lg md:grid-cols-4">
            {stats.map((stat) => (
              <li key={stat.label} className="flex min-w-0 flex-col">
                <span className="font-display-hero text-[1.65rem] leading-tight font-normal text-secondary-fixed sm:text-[2.125rem]">
                  {stat.value}
                </span>
                <span className="font-label-sm text-label-sm tracking-widest text-surface-variant/80 uppercase">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </div>
    </section>
  );
}
