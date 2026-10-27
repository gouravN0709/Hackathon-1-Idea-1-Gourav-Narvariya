import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { contact, menuPrices } from "@/lib/site-config";

const courses = [
  ["Bakailao tortilla", "Farm egg and salt cod"],
  ["Bakailao frijitua", "Fried cod with Gernika peppers"],
  ["Txuleton de vaca vieja", "Dry-aged beef over vine embers"],
  ["Gazta, membrillo & intxaurrak", "Idiazabal, quince, and walnuts"],
] as const;

export function BookingAside() {
  return (
    <div className="flex flex-col gap-space-lg">
      <article className="flex flex-col gap-space-md rounded-xl bg-surface p-space-lg shadow-sm md:p-space-xl">
        <div className="flex items-center gap-space-sm">
          <Icon name="receipt" className="h-7 w-7 text-primary" />
          <div>
            <p className="font-label-sm text-label-sm tracking-wider text-secondary uppercase">
              <TxServer>The sagardotegi table</TxServer>
            </p>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              <TxServer>Published tasting menu</TxServer>
            </h2>
          </div>
        </div>
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          The canonical lunch is served family-style. Course detail and the
          children&apos;s menu live on the menu page.
        </p>
        <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm">
          {courses.map(([name, detail]) => (
            <li key={name} className="flex items-baseline justify-between gap-space-md">
              <span className="font-medium text-on-surface">{name}</span>
              <span className="text-right text-on-surface-variant">{detail}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-space-md">
            <span className="font-semibold text-primary"><TxServer>Txotx cider</TxServer></span>
            <span className="font-semibold text-secondary"><TxServer>Included with the menu</TxServer></span>
          </li>
        </ul>
        <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-space-md">
          <span className="font-label-lg text-label-lg tracking-wider text-primary uppercase">
            <TxServer>Adult menu</TxServer>
          </span>
          <span className="font-headline-sm text-headline-sm text-primary">
            €{menuPrices.adult}{" "}
            <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">
              <TxServer>tax inc.</TxServer>
            </span>
          </span>
        </div>
        <p className="flex items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <span>Children&apos;s menu, ages {menuPrices.childAges}</span>
          <span className="font-semibold text-primary">€{menuPrices.child}</span>
        </p>
        <Link
          href="/menu#tasting-menus"
          className="inline-flex min-h-11 items-center gap-1 font-label-lg text-label-lg tracking-wider text-secondary uppercase hover:text-primary"
        >
          <TxServer>Read the full menu</TxServer>
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </article>

      <article className="flex flex-col gap-space-sm rounded-xl bg-surface-container p-space-lg md:p-space-xl">
        <div className="flex items-center gap-space-sm text-primary">
          <Icon name="snowflake" className="h-6 w-6" />
          <h2 className="font-headline-sm text-headline-sm"><TxServer>Cellar climate</TxServer></h2>
        </div>
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          The barrel cellar is kept cool for the cider, around 10°C–12°C. A warm
          layer and comfortable flat shoes are worth bringing, including in spring.
        </p>
      </article>

      <article className="flex flex-col gap-space-sm rounded-xl bg-surface p-space-lg shadow-sm md:p-space-xl">
        <p className="font-label-sm text-label-sm tracking-wider text-secondary uppercase">
          <TxServer>Gatherings</TxServer>
        </p>
        <h2 className="font-headline-sm text-headline-sm text-primary">
          <TxServer>Parties of 12 or more</TxServer>
        </h2>
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          The form stops at 11 adults. Larger parties should be discussed with
          the farm directly. This page cannot quote or hold a private table.
        </p>
        <div className="flex flex-col gap-space-sm pt-space-xs sm:flex-row">
          <a
            href={contact.phoneHref}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-surface-container-low px-space-md py-2.5 font-label-lg text-label-lg tracking-wide text-primary hover:bg-surface-container"
          >
            <Icon name="phone" className="h-[18px] w-[18px]" />
            Call
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-surface-container-low px-space-md py-2.5 font-label-lg text-label-lg tracking-wide text-primary hover:bg-surface-container"
          >
            <Icon name="mail" className="h-[18px] w-[18px]" />
            <TxServer>Group email</TxServer>
          </a>
        </div>
      </article>
    </div>
  );
}
