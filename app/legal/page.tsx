import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { SiteContainer } from "@/components/ui/site-container";
import { contact, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Legal | ${siteConfig.legalName}`,
  description:
    "Draft privacy and hospitality information for Iturrieta Sagardotegia. Full legal text pending owner review.",
};

export default function LegalPage() {
  return (
    <section className="bg-surface py-space-2xl">
      <SiteContainer className="flex max-w-2xl flex-col gap-space-lg py-space-xl">
        <span className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
          Legal · Legalak
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-normal text-primary">
          Privacy & hospitality information
        </h1>
        <p className="rounded-lg bg-surface-container-low p-space-md font-body-sm text-body-sm text-on-surface-variant">
          This page is a working draft, not final legal advice. Binding privacy policies and terms
          of hospitality still require review by the farm and qualified legal counsel before launch.
        </p>

        <section className="flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Who we are (operating name)</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {siteConfig.legalName} welcomes guests at {contact.addressLines.join(", ")}. General
            enquiries:{" "}
            <a className="text-primary underline" href={`mailto:${contact.infoEmail}`}>
              {contact.infoEmail}
            </a>
            . Reservations contact:{" "}
            <a className="text-primary underline" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            .
          </p>
        </section>

        <section className="flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Online reservations</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            When you submit a booking or use manage-booking, we process the details you provide
            (such as name, contact information, party size, date, and optional notes) to handle your
            reservation. Reference codes (for example ITU-…) let you look up or cancel eligible
            bookings. We do not publish a retention schedule here until it is approved by the owner.
          </p>
        </section>

        <section className="flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Still required before launch</h2>
          <ul className="list-disc pl-space-lg font-body-md text-body-md text-on-surface-variant">
            <li>Registered legal entity name, tax ID (CIF/NIF), and official postal address if different from the farm.</li>
            <li>Final privacy policy: lawful bases, retention periods, processors, international transfers, and guest rights.</li>
            <li>Cookie and analytics disclosure if tracking is enabled on the public site.</li>
            <li>Terms of hospitality: cancellation rules, deposits, allergens, and liability limits in farm-approved language.</li>
            <li>Confirmation whether email or SMS notifications will be used and the consent text shown at booking.</li>
          </ul>
        </section>

        <ButtonLink href="/" variant="underline" className="w-fit">
          Return to the homepage
        </ButtonLink>
      </SiteContainer>
    </section>
  );
}
