import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

export function FaqHelp() {
  return (
    <section className="w-full bg-surface-container-high py-space-2xl">
      <SiteContainer className="max-w-4xl">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-space-xl text-on-primary shadow-xl sm:p-space-2xl">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary-container/20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center space-y-space-md text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary px-space-md py-space-xs font-label-sm text-label-sm tracking-wider text-secondary-fixed uppercase">
              <Icon name="wine" className="h-3.5 w-3.5" />
              Personal cellar assistance
            </p>
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-primary md:text-headline-lg">
              We’re Happy to Help.
            </h2>
            <p className="max-w-xl font-body-lg text-body-lg text-on-primary-container">
              If a question is not answered here, call or email the farm. The
              online forms on this site do not replace that conversation.
            </p>
            <div className="flex w-full flex-col items-center gap-space-md pt-space-sm sm:w-auto sm:flex-row">
              <Link
                href="/visit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-surface px-space-lg py-space-sm font-label-lg text-label-lg tracking-wider text-primary uppercase shadow-md hover:bg-surface-container sm:w-auto"
              >
                Plan your visit
              </Link>
              <Link
                href="/book"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-secondary px-space-lg py-space-sm font-label-lg text-label-lg tracking-wider text-on-primary uppercase shadow-md hover:bg-on-secondary-container sm:w-auto"
              >
                Book a visit
              </Link>
            </div>
            <p className="flex flex-wrap items-center justify-center gap-space-md pt-space-md font-label-sm text-label-sm text-on-primary-container">
              <a href={contact.phoneHref} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                <Icon name="phone" className="h-4 w-4" />
                {contact.phoneDisplay}
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
              >
                <Icon name="mail" className="h-4 w-4" />
                {contact.email}
              </a>
            </p>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}
