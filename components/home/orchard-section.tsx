import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { orchardStages } from "@/lib/site-config";

export function OrchardSection() {
  return (
    <section id="orchard" className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-2xl">
        <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
              Ancestral Method
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
              From the mist-crowned orchard to the chestnut barrel.
            </h2>
          </div>
          <p className="max-w-sm font-body-sm text-body-sm text-on-surface-variant">
            A completely natural closed-loop process guided solely by autumnal
            temperature drops and centuries of oral memory.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {orchardStages.map((stage) => (
            <article
              key={stage.stage}
              className="group flex flex-col rounded bg-surface p-space-lg shadow-sm motion-safe:transition-shadow motion-safe:hover:shadow-md"
            >
              <div className="relative mb-space-md aspect-[4/3] w-full overflow-hidden rounded bg-surface-container-high">
                <ResponsiveImage
                  src={stage.image}
                  alt={stage.alt}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-sm text-label-sm font-bold tracking-widest text-secondary uppercase">
                  {stage.stage}
                </span>
                <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                  {stage.season}
                </span>
              </div>
              <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
                {stage.title}
              </h3>
              <p className="mb-space-md font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                {stage.body}
              </p>
              <div className="mt-auto flex items-center gap-space-xs pt-space-sm font-label-sm text-label-sm tracking-wider text-primary uppercase">
                <Icon name={stage.icon} className="h-4 w-4 text-secondary" />
                <span>{stage.note}</span>
              </div>
            </article>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}
