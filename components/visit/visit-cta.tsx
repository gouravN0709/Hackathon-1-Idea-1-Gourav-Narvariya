import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { SiteContainer } from "@/components/ui/site-container";

export function VisitCta() {
  return (
    <section className="w-full bg-primary py-space-2xl text-on-primary">
      <SiteContainer className="max-w-5xl space-y-space-lg text-center">
        <div className="mx-auto max-w-2xl space-y-space-xs">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary-fixed uppercase">
            Estate Sanctuary · Aramaio
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile leading-tight text-surface md:text-[52px] md:leading-[1.15]">
            <TxServer>We Look Forward to Welcoming You.</TxServer>
          </h2>
          <p className="mx-auto max-w-xl pt-space-xs font-body-lg text-body-lg text-surface-container-high/85">
            Midday service is Thursday to Sunday. Join the table in Aramaio when
            you have agreed a visit with the farm.
          </p>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-space-md pt-space-sm sm:flex-row sm:flex-wrap">
          <Link
            href="/book"
            className="inline-flex min-h-11 items-center justify-center rounded bg-secondary px-space-xl py-space-md font-label-lg text-label-lg tracking-widest text-surface uppercase shadow-md transition-colors hover:bg-on-secondary-container"
          >
            <TxServer>Prepare a request</TxServer>
          </Link>
          <Link
            href="/our-farm"
            className="inline-flex min-h-11 items-center justify-center rounded bg-primary-container px-space-xl py-space-md font-label-lg text-label-lg tracking-widest text-on-primary uppercase shadow-sm transition-colors hover:bg-primary"
          >
            <TxServer>Explore our farm</TxServer>
          </Link>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-x-space-lg gap-y-space-sm pt-space-xl font-body-sm text-body-sm text-tertiary-fixed">
          <span><TxServer>Caserío Goikola</TxServer></span>
          <span aria-hidden="true">·</span>
          <span><TxServer>Barrio Barajuen, Aramaio</TxServer></span>
          <span aria-hidden="true">·</span>
          <span><TxServer>Euskal Sagardoa DOP</TxServer></span>
        </p>
      </SiteContainer>
    </section>
  );
}
