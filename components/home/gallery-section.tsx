import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { galleryItems } from "@/lib/site-config";

export function GallerySection() {
  const featured = galleryItems.find((item) => item.featured);
  const supporting = galleryItems.filter((item) => !item.featured);

  if (!featured) {
    return null;
  }

  return (
    <section id="gallery" className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-space-xs text-center">
          <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            Estate Impressions
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-primary">
            Moments from the Aramaio Valley.
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Where steep mountain topography, Basque rainfall, and quiet
            generational patience converge.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-gutter md:grid-cols-12">
          <figure className="group relative min-h-[280px] overflow-hidden rounded-lg bg-surface-container-high shadow-sm md:col-span-7 md:min-h-[360px]">
            <ResponsiveImage
              src={featured.src}
              alt={featured.alt}
              sizes="(min-width: 768px) 58vw, 100vw"
              className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
            />
            <figcaption className="absolute bottom-4 left-4 rounded bg-surface/80 px-space-md py-1 font-label-sm text-label-sm text-primary backdrop-blur-md">
              {featured.caption}
            </figcaption>
          </figure>

          <div className="flex flex-col gap-gutter md:col-span-5">
            {supporting.map((item) => (
              <figure
                key={item.src}
                className="group relative h-[220px] overflow-hidden rounded-lg bg-surface-container-high shadow-sm md:h-[240px]"
              >
                <ResponsiveImage
                  src={item.src}
                  alt={item.alt}
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className="motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
                />
                <figcaption className="absolute bottom-3 left-3 rounded bg-surface/80 px-space-sm py-1 font-label-sm text-label-sm text-primary backdrop-blur-md">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
