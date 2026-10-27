import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { SiteContainer } from "@/components/ui/site-container";
import { contact } from "@/lib/site-config";

export function BookAssistance() {
  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <SiteContainer>
        <div className="flex flex-col items-start justify-between gap-space-lg rounded-xl bg-surface p-space-lg shadow-sm md:p-space-xl lg:flex-row lg:items-center">
          <div className="flex max-w-2xl flex-col gap-space-sm">
            <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
              <TxServer>Valley arrival & assistance</TxServer>
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              <TxServer>Questions about the drive or the menu?</TxServer>
            </h2>
            <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
              The mountain roads into Aramaio need a little care. This website
              does not arrange taxis or transfers. Call or email the farm, and
              use the visit page for the published route times.
            </p>
            <p className="flex flex-col gap-1 pt-space-xs font-body-sm text-body-sm text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-x-space-lg">
              <span>
                <strong className="text-on-surface"><TxServer>Telephone:</TxServer></strong>{" "}
                <a href={contact.phoneHref} className="underline underline-offset-4">
                  {contact.phoneDisplay}
                </a>
              </span>
              <span>
                <strong className="text-on-surface"><TxServer>Reservations:</TxServer></strong>{" "}
                <a href={`mailto:${contact.email}`} className="underline underline-offset-4">
                  {contact.email}
                </a>
              </span>
              <span>
                <strong className="text-on-surface"><TxServer>Information:</TxServer></strong>{" "}
                <a href={`mailto:${contact.infoEmail}`} className="underline underline-offset-4">
                  {contact.infoEmail}
                </a>
              </span>
            </p>
          </div>
          <Link
            href="/visit#directions"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary-container px-space-lg py-3.5 font-label-lg text-label-lg tracking-wide text-surface hover:bg-primary sm:w-auto"
          >
            <TxServer>View the route guide</TxServer>
          </Link>
        </div>
      </SiteContainer>
    </section>
  );
}
