import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { AccordionItem } from "@/components/ui/accordion-item";
import { SiteContainer } from "@/components/ui/site-container";
import { contact, diningHours, menuPrices, txotxSeasonLabel } from "@/lib/site-config";

export function VisitFaq() {
  return (
    <section id="visit-faq" className="w-full scroll-mt-24 bg-surface py-space-2xl">
      <SiteContainer className="max-w-4xl space-y-space-xl">
        <div className="mx-auto max-w-xl space-y-space-xs text-center">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            <TxServer>Practical knowledge</TxServer>
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
            <TxServer>Frequently Asked Questions</TxServer>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            A short set of visit answers. The full list is on the{" "}
            <Link href="/faq" className="text-primary underline underline-offset-4">
              <TxServer>FAQ page</TxServer>
            </Link>
            .
          </p>
        </div>

        <div className="space-y-space-md">
          <AccordionItem question="When are you open?" defaultOpen>
            <p>
              Midday service is {diningHours.openDays}, {diningHours.hours}.{" "}
              {diningHours.closedDays}, the dining room is closed.
            </p>
          </AccordionItem>
          <AccordionItem question="When is the Txotx season?">
            <p>
              Txotx season on this site runs {txotxSeasonLabel}, when cider is
              tasted from the barrels. Outside those months, ask the farm what is
              being poured. The tradition is introduced on{" "}
              <Link href="/#txotx" className="text-primary underline underline-offset-4">
                <TxServer>the homepage</TxServer>
              </Link>
              .
            </p>
          </AccordionItem>
          <AccordionItem question="How can I book a visit?">
            <p>
              Call {contact.phoneDisplay} or email {contact.email}. The{" "}
              <Link href="/book" className="text-primary underline underline-offset-4">
                <TxServer>booking form</TxServer>
              </Link>{" "}
              lets you check a request in the browser. It does not send or
              confirm a reservation.
            </p>
          </AccordionItem>
          <AccordionItem question="Can I visit with children?">
            <p>
              The published children&apos;s farm menu is €{menuPrices.child} for
              ages {menuPrices.childAges}. Courses are listed on{" "}
              <Link
                href="/menu#tasting-menus"
                className="text-primary underline underline-offset-4"
              >
                <TxServer>Menu & Cider</TxServer>
              </Link>
              .
            </p>
          </AccordionItem>
          <AccordionItem question="How do I find the cider house?">
            <p>
              {contact.addressLines[0]}, {contact.addressLines[1]},{" "}
              {contact.addressLines[2]}. The drive is about 35 minutes from
              Vitoria-Gasteiz, 45 minutes from Bilbao, and 55 minutes from
              Donostia-San Sebastián. Directions are in the section above, and
              on{" "}
              <a
                href={contact.mapsUrl}
                className="text-primary underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TxServer>Google Maps</TxServer>
              </a>
              .
            </p>
          </AccordionItem>
        </div>
      </SiteContainer>
    </section>
  );
}
