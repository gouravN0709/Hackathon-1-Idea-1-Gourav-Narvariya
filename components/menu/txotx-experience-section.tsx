import { TxServer } from "@/components/i18n/tx-server";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

const etiquette = [
  "Fill only three fingers’ height in your glass to consume while chilled and bubbling.",
  "Follow the cellar master from Kupela 01 to Kupela 12 across the afternoon.",
  "Everyone shares the queue as equals—from neighboring shepherds to visiting gastronomes.",
] as const;

export function TxotxExperienceSection() {
  return (
    <section className="w-full bg-surface-container-high py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-6">
            <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
              Chapter III · The Ancient Ritual
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal tracking-tight text-balance text-primary md:text-headline-lg">
              The Call that Opens Every Barrel:{" "}
              <span className="font-normal text-secondary italic">¡Txotx!</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              In Euskal Herria, cider is not brought to your table in a wine
              cooler. It is hunted at its source.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              When our cellarmaster calls out{" "}
              <strong className="font-medium text-primary">&quot;¡Txotx!&quot;</strong>{", conversation pauses. Guests rise in unison with their wide glasses in hand, migrating from the warm dining hearth into the chilled, stone-paved kupelategi. One by one, guests step forward to catch the arching golden stream directly from the wooden spigot, comparing the nuances of each oak barrel."}
            </p>
            <div className="flex flex-col gap-space-xs rounded-xl bg-surface p-space-md shadow-sm">
              <span className="font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase">
                <TxServer>The Unwritten Cellar Etiquette</TxServer>
              </span>
              <ul className="flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                {etiquette.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-space-xs">
              <ButtonLink href="/our-farm" variant="editorial">
                <TxServer>Discover Our Farm & Orchard History</TxServer>
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="relative pb-28 sm:pb-20 lg:col-span-6 lg:pb-16">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-container-highest shadow-xl">
              <ResponsiveImage
                src="/images/menu/txotx-cellar.jpg"
                alt="Guests in the stone cellar catching a stream of cider from a wooden barrel during txotx."
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </div>
            <blockquote className="absolute right-4 bottom-0 left-4 flex max-w-none flex-col gap-1 rounded-xl bg-primary p-space-md text-surface shadow-lg sm:right-6 sm:left-auto sm:max-w-[280px]">
              <span className="font-label-sm text-label-sm tracking-wider text-secondary-fixed uppercase">
                <TxServer>The Living Barrel</TxServer>
              </span>
              <p className="font-body-sm text-body-sm leading-tight text-on-primary-container">
                &quot;No two kupelak taste identical. Each tree, parcel, and cask
                develops its own quiet soul.&quot;
              </p>
            </blockquote>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
