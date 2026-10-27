import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { SiteContainer } from "@/components/ui/site-container";
import { txotxSeasonLabel } from "@/lib/site-config";

export function VisitSeason() {
  return (
    <section id="season" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer>
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="relative h-[520px] overflow-hidden rounded-xl shadow-xl">
              <ResponsiveImage
                src="/images/visit/txotx.jpg"
                alt="Cider poured in an arc from a chestnut barrel tap into a tilted glass in the cellar."
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="absolute right-space-lg bottom-space-lg left-space-lg rounded-lg bg-surface/90 p-space-md text-primary shadow-md backdrop-blur-md">
                <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                  The Txotx Ritual
                </p>
                <p className="font-title-editorial text-title-editorial italic">
                  “Hau da gure sagardo berria” — tasting the harvest before bottling.
                </p>
              </div>
            </div>
            <p className="absolute -top-4 -right-2 hidden rounded bg-secondary px-space-md py-space-xs font-label-sm text-label-sm font-semibold tracking-widest text-surface uppercase shadow-md sm:block">
              Cellar window · {txotxSeasonLabel}
            </p>
          </div>

          <div className="space-y-space-lg lg:col-span-6 lg:pl-space-md">
            <div className="space-y-space-xs">
              <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
                Tradition & seasons · {txotxSeasonLabel}
              </p>
              <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
                The Magic of the Txotx Season.
              </h2>
            </div>
            <div className="space-y-space-md font-body-md text-body-md leading-relaxed text-on-surface-variant">
              <p>
                From mid-January through late spring, the new vintage finishes
                spontaneous fermentation in chestnut barrels. This is when the cry
                of <strong className="font-medium text-primary">“Txotx!”</strong>{" "}
                calls guests to catch natural cider on the fly.
              </p>
              <p>
                The menu that accompanies the tasting — salt cod, txuleton, and
                Idiazabal — is described on the{" "}
                <Link href="/menu" className="text-primary underline underline-offset-4">
                  Menu & Cider
                </Link>{" "}
                page. The ritual itself is introduced in{" "}
                <Link href="/#txotx" className="text-primary underline underline-offset-4">
                  Experiences
                </Link>
                .
              </p>
              <div className="space-y-space-xs rounded-xl bg-surface-container p-space-md">
                <p className="font-label-sm text-label-sm font-semibold tracking-widest text-primary uppercase">
                  Outside txotx season
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Published midday hours remain Thursday to Sunday, 13:00–16:00.
                  This site does not list a separate menu for the months outside
                  txotx season. Ask the farm what is being served on your date.
                </p>
              </div>
            </div>
            <Link
              href="/book"
              className="inline-flex min-h-11 items-center gap-2 font-label-lg text-label-lg tracking-wider text-secondary uppercase transition-colors hover:text-primary"
            >
              Prepare a txotx request
              <Icon name="arrow-right" className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
