import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

export function TxotxSection() {
  return (
    <section id="txotx" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-primary text-surface shadow-xl lg:grid-cols-12">
          <div className="relative min-h-[420px] lg:col-span-7 lg:min-h-full">
            <ResponsiveImage
              src="/images/txotx.jpg"
              alt="The txotx ritual: a stream of natural cider pouring from a wooden barrel into a guest's glass."
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-primary/80 lg:block" />
          </div>
          <div className="flex flex-col justify-center gap-space-md p-space-xl lg:col-span-5 lg:p-space-2xl">
            <div className="flex items-center gap-space-xs text-secondary-fixed-dim">
              <Icon name="wine-glass" className="h-5 w-5" />
              <span className="font-label-sm text-label-sm font-semibold tracking-widest uppercase">
                The Living Tradition
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight font-normal text-surface">
              “¡Txotx!” The call that opens every barrel.
            </h2>
            <p className="font-body-md text-body-md leading-relaxed text-surface-container-high">
              Between mid-January and late spring, our cellar doors open to guests
              from across the world. When the cider master calls{" "}
              <em className="italic">“¡Txotx!”</em>, everyone rises from long
              communal tables to catch the foaming golden stream directly from the
              kupela bung.
            </p>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-primary-container">
              Pouring from three feet high aerates the natural carbon dioxide and
              awakens the volatile bouquet of wild apples, herbs, and cedar. It is
              a shared rite of conviviality that has united our valley for
              generations.
            </p>
            <div className="flex flex-col items-start gap-space-md pt-space-md sm:flex-row sm:items-center">
              <ButtonLink href="/#experiences" variant="amber">
                Explore the Txotx Ritual
              </ButtonLink>
              <span className="font-label-sm text-label-sm tracking-wider text-surface-container uppercase">
                Season: Jan 15 – May 18
              </span>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
