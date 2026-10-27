import { TxServer } from "@/components/i18n/tx-server";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { diningHours, menuPrices, txotxSeasonLabel } from "@/lib/site-config";

function buildHighlights(bookingLive: boolean) {
  return [
    {
      label: "Midday service",
      value: diningHours.openDaysShort,
      detail: `${diningHours.hours} · lunch only`,
    },
    {
      label: "Harvest window",
      value: "15 Jan – 18 May",
      detail: "Traditional txotx season",
    },
    {
      label: "Published menus",
      value: `€${menuPrices.adult} / €${menuPrices.child}`,
      detail: `Adult feast · children ${menuPrices.childAges}`,
    },
    bookingLive
      ? {
          label: "This form",
          value: "Live requests",
          detail: "Confirm on the review step to save a reference",
        }
      : {
          label: "This form",
          value: "Preview only",
          detail: "Nothing is sent or confirmed",
        },
  ] as const;
}

type BookHeroProps = {
  bookingLive: boolean;
};

export function BookHero({ bookingLive }: BookHeroProps) {
  const highlights = buildHighlights(bookingLive);
  return (
    <section className="w-full bg-surface py-space-xl lg:py-space-2xl">
      <SiteContainer className="flex flex-col gap-space-xl">
        <div className="grid grid-cols-1 items-end gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-8">
            <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
              Caserío Goikola · Dining in the orchards
            </p>
            <h1 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
              <TxServer>Your Table Awaits.</TxServer>
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              Prepare a seat request for the communal tables in Aramaio.{" "}
              {bookingLive
                ? "When online booking is live, confirming on the review step saves your request to the farm’s reservation system and issues a reference number."
                : "The form below checks your details in the browser. It does not contact the farm and it does not hold a table."}{" "}
              Txotx season on this site is {txotxSeasonLabel}.
            </p>
          </div>
          <aside className="flex w-full flex-col gap-2 rounded-xl bg-surface-container p-space-md shadow-sm lg:col-span-4 lg:max-w-xs lg:justify-self-end">
            <div className="flex items-center gap-2 text-secondary">
              <Icon name="calendar" className="h-5 w-5" />
              <p className="font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                <TxServer>Before you start</TxServer>
              </p>
            </div>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
              {bookingLive
                ? "Keep your reference for changes or cancellation. The farm may still call to confirm details during busy service."
                : "A real reservation still has to be made with the farm by telephone or email. This page only helps you review party size, date, and menu prices."}
            </p>
          </aside>
        </div>
        <dl className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex flex-col gap-2 rounded-xl bg-surface-container p-space-lg">
              <dt className="font-label-sm text-label-sm tracking-wider text-secondary uppercase">
                {item.label}
              </dt>
              <dd className="font-headline-sm text-headline-sm text-primary">{item.value}</dd>
              <dd className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </SiteContainer>
    </section>
  );
}
