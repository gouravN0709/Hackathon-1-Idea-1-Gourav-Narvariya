import { TxServer } from "@/components/i18n/tx-server";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";

export function TraditionsSection() {
  return (
    <section
      id="traditions"
      className="w-full scroll-mt-24 bg-tertiary py-space-2xl text-on-tertiary"
    >
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-6">
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-sm text-label-sm font-semibold tracking-[0.2em] text-secondary-fixed uppercase">
                Chapter IV · Communal Fellowship
              </span>
              <h2 className="font-headline-lg text-headline-lg-mobile leading-tight font-normal text-balance text-surface-container-lowest md:text-headline-lg">
                <TxServer>The Ancient Cry:</TxServer>
                <br />
                <em className="text-secondary-fixed italic">¡Txotx!</em> and Table
                Fellowship.
              </h2>
            </div>
            <p className="font-body-lg text-body-lg leading-relaxed font-light text-surface-container-highest/90">
              In Basque cider culture, cider is not merely consumed; it is shared
              standing together before immense wooden casks in cold stone cellars.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-surface-variant/80">
              Originally, the ritual began when buyers and neighboring farmers
              traveled to the <em><TxServer>sagardotegi</TxServer></em> in late winter to sample
              individual barrels before choosing what to purchase. They brought
              cod omelets and steaks to cook over wood coals to balance the brisk
              acidity of fresh unbottled cider.
            </p>
            <p className="font-body-md text-body-md leading-relaxed text-surface-variant/80">
              Today at Iturrieta, we uphold that communal ritual unaltered: long
              oak benches, charcoal-grilled txuleton, walnuts with Idiazabal
              cheese, and the winemaker&apos;s call of “¡Txotx!” inviting everyone
              up to catch the amber stream from the spigot.
            </p>
            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-secondary-fixed">
                  <TxServer>January — April</TxServer>
                </span>
                <span className="font-label-sm text-label-sm tracking-wider text-surface-container-highest uppercase">
                  <TxServer>Peak Txotx Season</TxServer>
                </span>
              </div>
              <div className="hidden h-10 w-px bg-outline/40 sm:block" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-secondary-fixed">
                  <TxServer>All Year Round</TxServer>
                </span>
                <span className="font-label-sm text-label-sm tracking-wider text-surface-container-highest uppercase">
                  <TxServer>Cellar Tastings & Visits</TxServer>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="relative h-[420px] sm:h-[520px]">
                <ResponsiveImage
                  src="/images/our-farm/txotx.jpg"
                  alt="Cider pouring in an arc from an oak kupela into a glass, with guests at long tables in the stone cellar."
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="object-[28%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
              </div>
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-space-md text-surface-container-lowest">
                <div className="min-w-0">
                  <span className="font-label-sm text-label-sm tracking-wider text-secondary-fixed uppercase">
                    Barrel Room Kupela Nº 07
                  </span>
                  <p className="font-title-editorial text-title-editorial italic">
                    <TxServer>The aerating arc unlocks natural carbonic bite & wild aromas.</TxServer>
                  </p>
                </div>
                <Icon name="wine-glass" className="h-8 w-8 shrink-0 text-secondary-fixed" />
              </div>
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
