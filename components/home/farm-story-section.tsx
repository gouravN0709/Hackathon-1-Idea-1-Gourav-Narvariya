import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

export function FarmStorySection() {
  return (
    <section id="story" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-surface-container-high shadow-lg">
              <ResponsiveImage
                src="/images/farm-portrait.jpg"
                alt="Mikel and Ane Goikoetxea in the stone cider cellar, resting their hands on a chestnut barrel."
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:hover:scale-105"
              />
            </div>
            <div className="relative z-10 mt-space-md flex max-w-xs flex-col rounded bg-surface-container-low p-space-lg shadow-md sm:absolute sm:-right-4 sm:-bottom-6 lg:-right-6">
              <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                Caserío Goikola
              </span>
              <span className="mt-1 font-title-editorial text-title-editorial text-primary">
                Mikel & Ane Goikoetxea
              </span>
              <span className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                4th & 5th Generation Sagardogileak
              </span>
            </div>
          </div>

          <div className="mt-space-lg flex flex-col gap-space-md lg:col-span-6 lg:mt-0 lg:pl-space-xl">
            <div className="flex items-center gap-space-xs">
              <span className="h-px w-8 bg-secondary" />
              <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                Chapter I · The Guardians
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
              A place shaped by family, land, and the rhythm of rain.
            </h2>
            <p className="font-body-lg text-body-lg font-light text-on-surface-variant">
              In the secluded amphitheater of the Aramaio Valley, cider is not
              merely fermented; it is listened to. For over a century, our family
              has tended eighty hectares of high-altitude biodynamic orchards
              clinging to ancient limestone gradients.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface">
              We rely exclusively on gravity flow, wooden screw presses dating
              from 1912, and the indigenous wild yeasts dormant on the skins of
              our bitter-sharp apples. We add no cultured yeasts, no sulfites,
              and no artificial carbonation. What flows from the spigot of our
              chestnut kupelak is the unadorned voice of our mountain
              microclimate.
            </p>
            <div className="flex flex-wrap items-center gap-space-lg pt-space-md">
              <ButtonLink href="/#orchard" variant="editorial">
                Meet Our Farm & Orchards
                <Icon name="arrow-right" className="h-[18px] w-[18px]" />
              </ButtonLink>
              <span className="font-light text-outline-variant">·</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant italic">
                Barrio Barajuen, Aramaio
              </span>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
