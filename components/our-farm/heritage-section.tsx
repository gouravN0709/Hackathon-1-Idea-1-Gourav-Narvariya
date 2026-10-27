import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";

export function HeritageSection() {
  return (
    <section id="heritage" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="relative h-[420px] overflow-hidden rounded-lg bg-surface-container shadow-md sm:h-[520px]">
              <ResponsiveImage
                src="/images/our-farm/heritage.jpg"
                alt="Stone doorway of the Iturrieta farmhouse, with a carved oak lintel above the cellar door and a copper apple scale beside it."
                sizes="(min-width: 1024px) 46vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent p-space-lg text-surface">
                <span className="font-label-sm text-label-sm tracking-widest text-secondary-fixed uppercase">
                  Caserío Iturrieta · Barajuen
                </span>
                <blockquote className="mt-1 font-headline-sm text-headline-sm text-surface-container-lowest italic">
                  “Preserving the soul of the baserri through wild natural cider.”
                </blockquote>
              </div>
            </div>
            <aside className="relative z-10 mt-space-md max-w-sm rounded-lg bg-surface-container-lowest p-space-md shadow-xl lg:absolute lg:-right-6 lg:-bottom-6 lg:mt-0">
              <div className="flex items-center gap-space-sm text-secondary">
                <Icon name="history" className="h-6 w-6 shrink-0" />
                <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                  <TxServer>Orchard Ledger 1998</TxServer>
                </span>
              </div>
              <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                Hand-planted along terraced slopes with heritage grafts rescued
                from abandoned orchards across the valley.
              </p>
            </aside>
          </div>

          <div className="flex flex-col gap-space-md lg:col-span-6 lg:pl-space-lg">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary uppercase">
                Chapter I · The Heritage
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-primary md:text-headline-lg">
                <TxServer>A family vision born among the misty orchards in 1998.</TxServer>
              </h2>
            </div>
            <p className="font-body-lg text-body-lg leading-relaxed text-on-surface">
              Founded in 1998 in the fertile, microclimate-rich valley of
              Aramaio—often called the <em><TxServer>Basque Switzerland</TxServer></em>—Iturrieta
              Sagardotegia was created with an unwavering reverence for
              traditional agroecology.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              What began as an intimate family commitment to rehabilitate
              neglected heirloom cider apple varieties quickly deepened into a
              working farmhouse sanctuary. We recognized that true Basque cider
              (<em><TxServer>sagardoa</TxServer></em>) does not happen in industrial stainless vats;
              it is born from cold mountain soil, humid coastal winds caught in
              the mountain cirque, and the intuitive hands of those who live
              beside the trees year-round.
            </p>
            <div className="mt-space-sm flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-lg">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Icon name="droplet" className="h-5 w-5 text-secondary" />
                <span className="font-title-editorial text-title-editorial">
                  <TxServer>Pure Valley Microclimate</TxServer>
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Shielded by Mount Anboto and Mount Gorbeia, our sheltered valley
                captures mild oceanic humidity while draining excess dampness
                through permeable limestone soils—ideal conditions for natural
                apple acidity and wild yeasts.
              </p>
            </div>
            <div className="pt-space-xs">
              <Link
                href="#custodians"
                className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary underline decoration-secondary/60 underline-offset-8 transition-colors hover:text-secondary"
              >
                <TxServer>Read our full estate chronicles</TxServer>
                <Icon name="arrow-up-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
