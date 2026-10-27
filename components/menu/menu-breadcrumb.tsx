import Link from "next/link";
import { SiteContainer } from "@/components/ui/site-container";

export function MenuBreadcrumb() {
  return (
    <section className="w-full bg-surface-container-low/60 backdrop-blur-md">
      <SiteContainer className="flex flex-col items-start justify-between gap-space-sm py-space-sm md:flex-row md:items-center">
        <nav aria-label="Breadcrumb">
          <ol className="flex list-none flex-wrap items-center gap-x-space-xs gap-y-1 font-label-sm text-label-sm tracking-widest text-on-surface-variant uppercase">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Estate Sanctuary
              </Link>
            </li>
            <li aria-hidden="true" className="text-secondary/60">
              /
            </li>
            <li className="font-semibold text-primary" aria-current="page">
              Menu & Cider · Upeltegia & Sukaldea
            </li>
          </ol>
        </nav>
        <p className="inline-flex max-w-full items-start gap-space-xs rounded bg-surface-container px-space-sm py-1 font-label-sm text-label-sm tracking-wider text-secondary uppercase">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
          <span>Traditional Wood-Fired Hearth & Kupelak · Aramaio Valley</span>
        </p>
      </SiteContainer>
    </section>
  );
}
