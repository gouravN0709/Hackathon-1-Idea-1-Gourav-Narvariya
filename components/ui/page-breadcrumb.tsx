import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { SiteContainer } from "@/components/ui/site-container";

type PageBreadcrumbProps = {
  current: string;
  note?: string;
};

export function PageBreadcrumb({ current, note }: PageBreadcrumbProps) {
  return (
    <section className="w-full bg-surface-container-low/70">
      <SiteContainer className="flex flex-col items-start justify-between gap-space-sm py-space-sm md:flex-row md:items-center">
        <nav aria-label="Breadcrumb">
          <ol className="flex list-none flex-wrap items-center gap-x-space-xs gap-y-1 font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                <TxServer>Estate Sanctuary</TxServer>
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/60">
              /
            </li>
            <li className="font-semibold text-primary" aria-current="page">
              {current}
            </li>
          </ol>
        </nav>
        {note ? (
          <p className="max-w-full font-label-sm text-label-sm tracking-wider text-secondary uppercase">
            {note}
          </p>
        ) : null}
      </SiteContainer>
    </section>
  );
}
