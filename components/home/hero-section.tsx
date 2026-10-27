import { TxServer } from "@/components/i18n/tx-server";
import { ButtonLink } from "@/components/ui/button-link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const stats = [
  {
    value: "1882",
    label: "Heritage Estate",
    detail: "Continuous family stewardship across five generations",
  },
  {
    value: "100%",
    label: "Native Cultivars",
    detail: "Urtebi Txiki, Moko, Gezamina & Mozoloa apples",
  },
  {
    value: "Zero",
    label: "Additives",
    detail: "Spontaneous wild fermentation in historic chestnut casks",
  },
] as const;

export async function HeroSection() {
  const t = await getTranslations("home.hero");
  return (
    <section className="relative flex min-h-[92vh] w-full -mt-20 flex-col justify-between overflow-hidden bg-primary pt-20">
      <div className="pointer-events-none absolute inset-0">
        <ResponsiveImage
          src="/images/hero.jpg"
          alt="Caserío Goikola on the emerald slopes of the Aramaio Valley, with morning mist among native apple orchards."
          sizes="100vw"
          priority
          className="scale-105 opacity-40 mix-blend-luminosity motion-safe:transition-transform motion-safe:duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/30" />
      </div>

      <SiteContainer className="relative flex flex-1 flex-col justify-center pt-24 pb-16">
        <div className="flex max-w-3xl flex-col items-start gap-space-lg">
          <div className="flex items-center gap-space-sm rounded-full bg-surface/10 px-space-md py-1 text-surface-container-low shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-fixed-dim motion-safe:animate-pulse" />
            <span className="font-label-sm text-label-sm tracking-widest text-surface uppercase">
              Aramaio Valley · Basque Country · Est. 1882
            </span>
          </div>
          <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-balance font-normal leading-tight text-surface">
            <TxServer>From our apple trees</TxServer>
            <br />
            <span className="font-display-hero font-normal text-surface-container-high italic">
              <TxServer>to your table.</TxServer>
            </span>
          </h1>
          <p className="max-w-xl font-body-lg text-body-lg font-light text-surface-container-high">
            A secluded family farm. Ancestral wild-fermented sagardoa. Unhurried
            Basque hearth hospitality nestled beneath the limestone peaks of
            Anboto.
          </p>
          <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
            <ButtonLink href="/book" variant="hero">
              {t("bookCta")}
            </ButtonLink>
            <ButtonLink href="/#story" variant="ghost">
              <TxServer>Discover Our Story</TxServer>
              <Icon
                name="arrow-right"
                className="h-[18px] w-[18px] motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
              />
            </ButtonLink>
          </div>
        </div>
      </SiteContainer>

      <div className="relative w-full bg-surface-container-highest/90 shadow-sm backdrop-blur-md">
        <SiteContainer className="grid grid-cols-1 gap-gutter py-space-lg md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 items-center gap-space-md">
              <span className="shrink-0 font-headline-md text-headline-md font-normal text-primary">
                {stat.value}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
                  {stat.label}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {stat.detail}
                </span>
              </div>
            </div>
          ))}
        </SiteContainer>
      </div>
    </section>
  );
}
