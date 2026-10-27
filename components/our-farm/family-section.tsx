import { TxServer } from "@/components/i18n/tx-server";
import { Icon, type IconName } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const values: ReadonlyArray<{
  icon: IconName;
  title: string;
  body: string;
}> = [
  {
    icon: "handshake",
    title: "Radical Care",
    body: "Zero compromise on artisan purity.",
  },
  {
    icon: "hearth",
    title: "True Hearth",
    body: "Generous, unfiltered Basque warmth.",
  },
  {
    icon: "stewards",
    title: "Land Stewards",
    body: "Passing healthy soil to the next generation.",
  },
];

export function FamilySection() {
  return (
    <section id="custodians" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="relative h-[460px] overflow-hidden rounded-xl shadow-md sm:h-[500px]">
              <ResponsiveImage
                src="/images/our-farm/family.jpg"
                alt="The Iturrieta family together in the stone cider cellar, beside the wooden press and large barrels."
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-top"
              />
            </div>
            <div className="mt-space-sm flex flex-wrap items-center justify-between gap-space-sm rounded-lg bg-surface-container-high p-space-md">
              <span className="font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase">
                <TxServer>Custodians of Iturrieta</TxServer>
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                <TxServer>Continuous Craft Since 1998</TxServer>
              </span>
            </div>
          </div>

          <div className="order-1 flex flex-col gap-space-md lg:order-2 lg:col-span-7 lg:pl-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
                The Custodians · Four Hands, One Craft
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-primary md:text-headline-lg">
                <TxServer>Not a corporate winery.</TxServer>
                <br className="hidden sm:inline" /> <TxServer>A living Basque family baserri.</TxServer>
              </h2>
            </div>
            <p className="font-body-lg text-body-lg leading-relaxed text-on-surface">
              At Iturrieta, there are no detached investors or outsourced cellar
              hands. The same hands that prune the apple canopies in cold
              February winds are the ones that manage the press in October,
              monitor fermentation barrels through December, and light the dining
              room hearth to welcome visitors.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              We believe that natural cider is an expression of human intimacy
              with the local land. When you visit our farmhouse, you are welcomed
              directly into our family home, tasting the exact cider we drink
              around our own dinner table.
            </p>
            <ul className="grid grid-cols-1 gap-space-md pt-space-xs sm:grid-cols-3">
              {values.map((value) => (
                <li
                  key={value.title}
                  className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-space-md"
                >
                  <Icon name={value.icon} className="h-[22px] w-[22px] text-secondary" />
                  <span className="font-label-sm text-label-sm font-bold tracking-wider text-primary uppercase">
                    {value.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {value.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
