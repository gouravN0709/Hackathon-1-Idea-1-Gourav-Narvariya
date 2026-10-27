import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const frames = [
  {
    src: "/images/menu/gallery-txuleton.jpg",
    alt: "Bone-in txuleton searing on a grate over glowing oak embers.",
    title: "Txuleton on Vine Embers",
    label: "Asador Live",
    ratio: "aspect-[4/5]",
    offset: false,
  },
  {
    src: "/images/menu/gallery-pour.jpg",
    alt: "A wide glass of golden cider with a light foam, held above a wooden bench.",
    title: "The Fresh Pour",
    label: "Txinparta",
    ratio: "aspect-square",
    offset: true,
  },
  {
    src: "/images/menu/gallery-idiazabal.jpg",
    alt: "Wedges of Idiazabal cheese, quince membrillo, and walnuts on a wooden board.",
    title: "Idiazabal & Membrillo",
    label: "Dessert Course",
    ratio: "aspect-[4/5]",
    offset: false,
  },
  {
    src: "/images/menu/gallery-table.jpg",
    alt: "A long communal farmhouse table set with bread, cider glasses, and friends dining.",
    title: "The Communal Table",
    label: "Fellowship",
    ratio: "aspect-square",
    offset: false,
  },
  {
    src: "/images/menu/gallery-barrels.jpg",
    alt: "A quiet row of weathered oak cider barrels in a stone cellar.",
    title: "Century Kupelak",
    label: "Cellar Vault",
    ratio: "aspect-[4/5]",
    offset: true,
  },
  {
    src: "/images/menu/gallery-apples.jpg",
    alt: "Heritage cider apples gathered in rough wooden harvest crates.",
    title: "Native Cultivar Harvest",
    label: "Orchard Soil",
    ratio: "aspect-square",
    offset: false,
  },
] as const;

export function CompanyGallerySection() {
  return (
    <section className="w-full bg-surface py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-space-xs text-center">
          <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
            Visual Chronicle
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal tracking-tight text-primary md:text-headline-lg">
            Food, Cider & Company
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Snapshots of daily life at Caserío Goikola: where the smoke of the
            asador mingles with the mist of Mount Anboto.
          </p>
        </div>

        <ul className="grid grid-cols-1 items-start gap-gutter pb-2 sm:grid-cols-2 sm:pb-12 lg:grid-cols-3">
          {frames.map((frame) => (
            <li
              key={frame.src}
              className={
                frame.offset
                  ? "group flex flex-col gap-space-xs sm:translate-y-8"
                  : "group flex flex-col gap-space-xs"
              }
            >
              <figure className="flex flex-col gap-space-xs">
                <div
                  className={`relative w-full overflow-hidden rounded-xl bg-surface-container-high shadow-md ${frame.ratio}`}
                >
                  <ResponsiveImage
                    src={frame.src}
                    alt={frame.alt}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="transition-transform duration-500 motion-safe:group-hover:scale-105"
                  />
                </div>
                <figcaption className="flex flex-wrap items-baseline justify-between gap-x-space-sm gap-y-1 px-1">
                  <span className="font-title-editorial text-title-editorial text-primary">
                    {frame.title}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary uppercase">
                    {frame.label}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </SiteContainer>
    </section>
  );
}
