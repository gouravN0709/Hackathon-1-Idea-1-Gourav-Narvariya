import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const features = [
  {
    image: "/images/book/txuleton.jpg",
    alt: "Bone-in txuleton searing over wood embers in a cider-house kitchen.",
    kicker: "01 · Gastronomy",
    title: "The Canonical Feast",
    body: "Farmhouse dining built around salt cod, Gernika peppers, and txuleton cut for the table.",
    href: "/menu#tasting-menus",
    cta: "Explore the full menu",
  },
  {
    image: "/images/book/txotx.jpg",
    alt: "A stream of cider pouring from a chestnut barrel tap into a guest’s glass.",
    kicker: "02 · Tradition",
    title: "The Txotx Ritual",
    body: "When “Txotx!” is called, guests rise together and catch cider from the historic barrels.",
    href: "/#txotx",
    cta: "Discover the ritual",
  },
  {
    image: "/images/book/orchard.jpg",
    alt: "Terraced apple orchards on a green hillside in the Aramaio valley.",
    kicker: "03 · Land & lineage",
    title: "Mountain Orchards",
    body: "About 1,400 organic apple trees on the estate slopes. The farm story explains how they are grown.",
    href: "/our-farm",
    cta: "Read our farm story",
  },
] as const;

export function BookExpect() {
  return (
    <section className="w-full bg-surface py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="flex max-w-2xl flex-col gap-space-sm">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            <TxServer>The rhythms of Caserío Goikola</TxServer>
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
            <TxServer>What to Expect During Your Visit</TxServer>
          </h2>
          <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
            An afternoon at Iturrieta is a cider-house lunch in the Aramaio valley:
            the menu, the barrel tasting, and the orchards around the farm.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="group flex flex-col gap-space-md">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-high">
                <ResponsiveImage
                  src={feature.image}
                  alt={feature.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-label-sm text-label-sm tracking-widest text-secondary uppercase">
                  {feature.kicker}
                </p>
                <h3 className="font-headline-sm text-headline-sm text-primary">{feature.title}</h3>
                <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  {feature.body}
                </p>
                <Link
                  href={feature.href}
                  className="inline-flex min-h-11 items-center gap-1 pt-1 font-label-lg text-label-lg text-secondary hover:text-primary"
                >
                  {feature.cta}
                  <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
