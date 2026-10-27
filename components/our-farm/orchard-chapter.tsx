import { TxServer } from "@/components/i18n/tx-server";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const plots: ReadonlyArray<{
  image: string;
  alt: string;
  badge: string;
  eyebrow: string;
  title: string;
  body: ReactNode;
  note: string;
  icon: IconName;
}> = [
  {
    image: "/images/our-farm/cultivars.jpg",
    alt: "Green and russet cider apples on linen, with autumn leaves and wooden bowls.",
    badge: "14 Native Cultivars",
    eyebrow: "Botanical Balance",
    title: "Native Biodiverse Cultivars",
    body: (
      <>
        Rather than monocultures, our orchard intertwines sharp, tannic, and
        bittersweet varietals: acidic <em>Moko</em> for crisp backbone, aromatic{" "}
        <em><TxServer>Urtebi Txiki</TxServer></em>, and phenolic <em><TxServer>Gezamina</TxServer></em> for deep amber
        structure.
      </>
    ),
    note: "Sugar & Tannin Harmony",
    icon: "flower",
  },
  {
    image: "/images/our-farm/orchard-rows.jpg",
    alt: "Blossoming apple rows on a hillside, with wildflowers, beehives, and mist in the valley.",
    badge: "Zero Synthetic Chemistry",
    eyebrow: "Agroecological Rhythm",
    title: "Organic & Dry-Farmed",
    body: (
      <>
        We never irrigate; deep roots search for moisture in bedrock limestone.
        Biodynamic cover crops foster living soil microbiology, while valley
        wild bees ensure natural pollination without industrial interference.
      </>
    ),
    note: "Wild Pollination Cycle",
    icon: "bee",
  },
  {
    image: "/images/our-farm/harvest.jpg",
    alt: "A farmer gathering fallen cider apples into a chestnut basket with a wooden harvesting tool.",
    badge: "Autumn Ritual",
    eyebrow: "Ancestral Hand Gathering",
    title: "The Rhythm of Harvest",
    body: (
      <>
        Apples are only gathered when fully ripe, using traditional wooden spike
        tools (<em>kizki</em>) so delicate skins remain unbruised. Multiple
        selective passes through October and November guarantee peak aromatic
        ripeness.
      </>
    ),
    note: "Hand-Harvested with Kizki",
    icon: "hand",
  },
];

export function OrchardChapter() {
  return (
    <section
      id="orchard"
      className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl"
    >
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
              Chapter II · The Terraces
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-primary md:text-headline-lg">
              <TxServer>The Living Orchard: 1,400 Trees, One Valley.</TxServer>
            </h2>
            <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
              High-altitude terraces, mineral-rich limestone soils, and clean
              mountain mists foster 14 native apple varieties including Urtebi
              Txiki, Moko, Gezamina, and Mozoloa.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start rounded-lg bg-surface p-space-sm shadow-sm md:self-auto">
            <span className="h-3 w-3 rounded-full bg-primary-container motion-safe:animate-pulse" />
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase">
              <TxServer>Certified Organic (Ekolur)</TxServer>
            </span>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {plots.map((plot) => (
            <li
              key={plot.title}
              className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm motion-safe:transition-shadow motion-safe:hover:shadow-md"
            >
              <div className="relative h-64 overflow-hidden">
                <ResponsiveImage
                  src={plot.image}
                  alt={plot.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded bg-tertiary/90 px-space-sm py-1 font-label-sm text-label-sm tracking-wider text-on-tertiary uppercase">
                  {plot.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-space-md p-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
                    {plot.eyebrow}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {plot.title}
                  </h3>
                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    {plot.body}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/30 pt-space-xs font-body-sm text-body-sm font-medium text-primary">
                  <span>{plot.note}</span>
                  <Icon name={plot.icon} className="h-[18px] w-[18px] text-secondary" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SiteContainer>
    </section>
  );
}
