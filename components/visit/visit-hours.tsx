import { TxServer } from "@/components/i18n/tx-server";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SiteContainer } from "@/components/ui/site-container";
import { diningHours } from "@/lib/site-config";

const openDays = [
  { day: "Thursday", badge: "Lunch", tone: "quiet" },
  { day: "Friday", badge: "Lunch", tone: "quiet" },
  { day: "Saturday", badge: "Lunch", tone: "weekend" },
  { day: "Sunday", badge: "Lunch", tone: "weekend" },
] as const;

export function VisitHours() {
  return (
    <section id="hours" className="w-full scroll-mt-24 bg-surface-container-low py-space-2xl">
      <SiteContainer className="space-y-space-xl">
        <div className="max-w-2xl space-y-space-xs">
          <p className="font-label-sm text-label-sm font-semibold tracking-widest text-secondary uppercase">
            <TxServer>Service calendar</TxServer>
          </p>
          <h2 className="font-headline-lg text-headline-lg-mobile tracking-tight text-primary md:text-headline-lg">
            <TxServer>Cellar Doors & Dining Hours</TxServer>
          </h2>
          <p className="pt-space-xs font-body-lg text-body-lg text-on-surface-variant">
            Midday service is {diningHours.openDays}, {diningHours.hours}.{" "}
            {diningHours.closedDays}, the dining room is closed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-5">
          {openDays.map((day) => (
            <article
              key={day.day}
              className="flex flex-col justify-between gap-space-md rounded-xl bg-surface p-space-lg shadow-sm"
            >
              <div className="space-y-space-xs">
                <span
                  className={
                    day.tone === "weekend"
                      ? "inline-flex rounded bg-secondary/15 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-secondary uppercase"
                      : "inline-flex rounded bg-surface-tint/15 px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary uppercase"
                  }
                >
                  {day.badge}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{day.day}</h3>
                <p className="font-headline-md text-headline-md font-light text-primary">
                  {diningHours.hours}
                </p>
              </div>
              <p className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-surface-tint uppercase">
                <span className="h-2 w-2 rounded-full bg-surface-tint" />
                <TxServer>Txotx & menu open</TxServer>
              </p>
            </article>
          ))}
          <article className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container p-space-lg shadow-sm">
            <div className="space-y-space-xs">
              <span className="inline-flex rounded bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
                Rest
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {diningHours.closedDaysShort}
              </h3>
              <p className="font-headline-md text-headline-md font-light text-on-surface-variant">
                Closed
              </p>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <TxServer>Cellar tending, bottling, and orchard work.</TxServer>
            </p>
          </article>
        </div>

        <div className="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-highest p-space-lg shadow-sm md:flex-row md:items-center">
          <div className="flex items-start gap-space-md">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-on-primary">
              <Icon name="calendar" className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                <TxServer>Reservations are strongly recommended</TxServer>
              </h3>
              <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
                The booking form on this website checks details in the browser
                only. It does not reserve a table. Call or email the farm to
                enquire about a visit.
              </p>
            </div>
          </div>
          <Link
            href="/book"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded bg-primary px-space-lg py-space-sm font-label-lg text-label-lg tracking-wider text-on-primary uppercase transition-colors hover:bg-primary-container"
          >
            <TxServer>Prepare a request</TxServer>
          </Link>
        </div>
      </SiteContainer>
    </section>
  );
}
