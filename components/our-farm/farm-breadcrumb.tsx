import Link from "next/link";
import { SiteContainer } from "@/components/ui/site-container";

export function FarmBreadcrumb() {
  return (
    <section className="w-full bg-surface-container-low/70 py-space-sm">
      <SiteContainer className="flex items-center justify-between gap-space-md">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-space-sm gap-y-1 font-body-sm text-body-sm text-on-surface-variant"
        >
          <ol className="flex list-none flex-wrap items-center gap-x-space-sm gap-y-1">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Estate Sanctuary
              </Link>
            </li>
            <li aria-hidden="true" className="text-outline/60">
              /
            </li>
            <li className="font-semibold text-primary" aria-current="page">
              Our Farm & Heritage
            </li>
          </ol>
          <span aria-hidden="true" className="hidden text-outline/40 md:inline">
            ·
          </span>
          <span className="hidden font-label-sm text-label-sm tracking-widest text-secondary uppercase md:inline">
            Iturrieta Sagardotegia · Aramaio Valley
          </span>
        </nav>
        <div className="hidden shrink-0 items-center gap-space-md sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded bg-tertiary-fixed px-space-sm py-0.5 font-label-sm text-label-sm tracking-wider text-primary uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            Caserío Iturrieta
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Álava, Basque Country
          </span>
        </div>
      </SiteContainer>
    </section>
  );
}
