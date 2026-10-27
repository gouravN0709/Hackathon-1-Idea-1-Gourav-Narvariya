import { TxServer } from "@/components/i18n/tx-server";
import type { IconName } from "@/components/ui/icon";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const pillars: ReadonlyArray<{
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  icon: IconName;
}> = [
  {
    image: "/images/menu/orchard-mist.jpg",
    alt: "Misty terraced apple orchard with native cider apples hanging in the morning fog.",
    eyebrow: "01 / Mountain Terroir & Native Cultivars",
    title: "High-Altitude Acidic Soils",
    body: "Persistent morning valley fog and steep limestone slopes yield thick-skinned, tannic apples with naturally piercing malic acidity and intense phenolic character.",
    note: "Elevation 450m · Biodynamic Soil",
    icon: "mountain",
  },
  {
    image: "/images/menu/cellar-kupelak.jpg",
    alt: "Monumental chestnut and oak cider barrels standing in a dim stone cellar.",
    eyebrow: "02 / Spontaneous Kupela Fermentation",
    title: "Slow Winter Maturation",
    body: "Resting silently in massive 10,000-liter chestnut and oak casks over the freezing Pyrenean winter. Never pasteurized, never carbonated, bottled purely as living cider.",
    note: "Zero Sulfites · Indigenous Yeasts",
    icon: "sparkle",
  },
  {
    image: "/images/menu/cider-pour.jpg",
    alt: "A high pour of golden Basque cider breaking against a tilted glass and raising a fine froth.",
    eyebrow: "03 / The Ritual of the Pour",
    title: 'Releasing the "Txinparta"',
    body: "By cascading the cider from arm’s height against the tilted glass wall, natural micro-bubbles dissolve, volatile orchard bouquets awaken, and acidity softens into sheer silk.",
    note: "Drink Immediately in Two Sips",
    icon: "wine-glass",
  },
];

export function NaturalCiderSection() {
  return (
    <section id="natural-cider" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 items-end gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-xs lg:col-span-8">
            <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
              Chapter II · The Living Sagardoa
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal tracking-tight text-balance text-primary md:text-headline-lg">
              <TxServer>Unfiltered, Wild & Born from Organic Mountain Fruit</TxServer>
            </h2>
            <p className="max-w-3xl pt-2 font-body-lg text-body-lg text-on-surface-variant">
              In our cool, cloud-hung valley, 14 heritage Basque apple
              cultivars—including{" "}
              <em className="font-medium text-primary">
                <TxServer>Urtebi Txiki, Moko, Gezamina</TxServer>
              </em>{", and "}
              <em className="font-medium text-primary">Mozoloa</em>{"—are gathered by hand, ground in slow timber mills, and transformed through wild indigenous orchard yeasts without sulfites or added sugars."}
            </p>
          </div>
          <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container-high p-space-md lg:col-span-4">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase">
              Tasting Profile · Euskal Sagardoa DOP
            </span>
            <dl className="flex flex-col gap-1 pt-1 font-body-sm text-body-sm">
              <div>
                <dt className="inline font-semibold text-primary"><TxServer>Aromatics:</TxServer> </dt>
                <dd className="inline text-on-surface-variant">
                  Crisp green apple skins, crushed wild mountain mint, damp
                  limestone.
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-primary">Palate: </dt>
                <dd className="inline text-on-surface-variant">
                  Electric malic acidity, light phenolic grip, bone-dry and
                  mouthwatering.
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-primary"><TxServer>Sparkle:</TxServer> </dt>
                <dd className="inline text-on-surface-variant">
                  <TxServer>Delicate, volatile txinparta bead released upon the high pour.</TxServer>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-gutter pt-space-sm md:grid-cols-3">
          {pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="group flex flex-col overflow-hidden rounded-xl bg-surface-container shadow-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-highest">
                <ResponsiveImage
                  src={pillar.image}
                  alt={pillar.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-space-xs p-space-lg">
                <div className="flex flex-col gap-1">
                  <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                    {pillar.eyebrow}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {pillar.title}
                  </h3>
                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    {pillar.body}
                  </p>
                </div>
                <p className="flex items-center gap-space-xs pt-space-md font-label-sm text-label-sm text-primary uppercase">
                  <Icon name={pillar.icon} className="h-4 w-4 shrink-0 text-secondary" />
                  <span>{pillar.note}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SiteContainer>
    </section>
  );
}
