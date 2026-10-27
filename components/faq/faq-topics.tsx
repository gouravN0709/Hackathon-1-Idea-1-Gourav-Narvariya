import Link from "next/link";
import { AccordionItem } from "@/components/ui/accordion-item";
import { SiteContainer } from "@/components/ui/site-container";
import {
  FaqChangeOrCancelAnswer,
  FaqHowToBookAnswer,
  FaqManageBookingAnswer,
} from "@/lib/booking/customer-copy";
import { contact, diningHours, menuPrices, txotxSeasonLabel } from "@/lib/site-config";

type FaqTopicsProps = {
  bookingLive?: boolean;
};

export function FaqTopics({ bookingLive = false }: FaqTopicsProps) {
  const topics = [
    { href: "#planning-visit", label: "Planning your visit" },
    { href: "#menu-cider", label: "Menu & cider" },
    { href: "#reservations", label: "Reservations" },
    { href: "#before-arrival", label: "Before you arrive" },
  ] as const;

  return (
    <>
      <nav
        aria-label="FAQ topics"
        className="sticky top-20 z-30 w-full bg-surface-container-high py-space-sm shadow-sm"
      >
        <SiteContainer className="flex items-center gap-space-md overflow-x-auto">
          <span className="hidden shrink-0 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase md:inline">
            Jump to topic:
          </span>
          <ul className="flex items-center gap-space-sm">
            {topics.map((topic) => (
              <li key={topic.href}>
                <a
                  href={topic.href}
                  className="inline-flex min-h-11 items-center rounded-lg bg-surface px-space-md py-space-xs font-label-lg text-label-lg whitespace-nowrap text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
                >
                  {topic.label}
                </a>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </nav>

      <div className="w-full bg-surface py-space-xl">
        <SiteContainer className="max-w-5xl space-y-space-2xl">
          <section id="planning-visit" className="scroll-mt-36">
            <TopicHeading index="01" title="Planning Your Visit" aside="Opening & valley access" />
            <div className="space-y-space-sm">
              <AccordionItem
                question="When are you open?"
                defaultOpen
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  We welcome guests for the traditional midday meal from Thursday
                  to Sunday, between 13:00 and 16:00. From Monday to Wednesday the
                  dining room is closed.
                </p>
                <p className="pt-space-xs font-label-sm text-label-sm text-secondary">
                  {diningHours.openDays}: {diningHours.hours}
                </p>
              </AccordionItem>
              <AccordionItem
                question="When is txotx season?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Txotx season on this site runs {txotxSeasonLabel}, when the
                  year&apos;s cider is tasted from the kupelak. Outside that
                  window, ask the farm what is being poured during the same
                  Thursday-to-Sunday service hours. The ritual is introduced on{" "}
                  <Link href="/#txotx" className="font-medium text-primary underline underline-offset-4">
                    the homepage
                  </Link>
                  .
                </p>
              </AccordionItem>
              <AccordionItem
                question="Where is Iturrieta Sagardotegia located?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Caserío Goikola, Barrio Barajuen, Aramaio (Álava). Driving times
                  from Vitoria-Gasteiz, Bilbao, and Donostia-San Sebastián are on{" "}
                  <Link href="/visit" className="font-medium text-primary underline underline-offset-4">
                    Visit Us
                  </Link>
                  .
                </p>
              </AccordionItem>
              <AccordionItem
                question="How can I contact you?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Telephone{" "}
                  <a href={contact.phoneHref} className="font-medium text-primary underline underline-offset-4">
                    {contact.phoneDisplay}
                  </a>
                  , reservations at{" "}
                  <a
                    href={`mailto:${contact.email}`}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {contact.email}
                  </a>
                  , or general enquiries at{" "}
                  <a
                    href={`mailto:${contact.infoEmail}`}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {contact.infoEmail}
                  </a>
                  . Addresses and the map are on{" "}
                  <Link href="/visit" className="font-medium text-primary underline underline-offset-4">
                    Visit Us
                  </Link>
                  . This site does not list a WhatsApp number.
                </p>
              </AccordionItem>
            </div>
          </section>

          <section id="menu-cider" className="scroll-mt-36">
            <TopicHeading index="02" title="Menu & Cider" aside="Culinary tradition" />
            <div className="space-y-space-sm">
              <AccordionItem
                question="How much does the menu cost?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  The canonical sagardotegi menu is €{menuPrices.adult} per adult,
                  VAT included, with the courses and cider pouring described on
                  the menu page. The children&apos;s farm menu is €{menuPrices.child}{" "}
                  for ages {menuPrices.childAges}.
                </p>
                <p className="mt-space-sm flex flex-col justify-between gap-2 rounded-lg bg-surface-container p-space-sm font-body-sm text-body-sm sm:flex-row">
                  <span className="font-medium text-primary">
                    Canonical menu: €{menuPrices.adult} / adult
                  </span>
                  <span>
                    Children&apos;s farm menu: €{menuPrices.child} (ages {menuPrices.childAges})
                  </span>
                </p>
              </AccordionItem>
              <AccordionItem
                question="What is the txotx experience?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Txotx is the Basque cellar tradition: dining pauses, guests
                  gather at the chestnut barrels, and cider is caught straight
                  from the tap. Read more in{" "}
                  <Link href="/#experiences" className="font-medium text-primary underline underline-offset-4">
                    Experiences
                  </Link>{" "}
                  and on{" "}
                  <Link href="/menu" className="font-medium text-primary underline underline-offset-4">
                    Menu & Cider
                  </Link>
                  .
                </p>
              </AccordionItem>
              <AccordionItem
                question="Where can I learn more about the menu?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Courses, the children&apos;s menu, and the cider are on{" "}
                  <Link href="/menu" className="font-medium text-primary underline underline-offset-4">
                    Menu & Cider
                  </Link>
                  .
                </p>
              </AccordionItem>
            </div>
          </section>

          <section id="reservations" className="scroll-mt-36">
            <TopicHeading index="03" title="Reservations" aside="Booking & seatings" />
            <div className="space-y-space-sm">
              <AccordionItem
                question="How do I book a visit?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <FaqHowToBookAnswer live={bookingLive} />
              </AccordionItem>
              <AccordionItem
                question="How can I manage an existing booking?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <FaqManageBookingAnswer live={bookingLive} />
              </AccordionItem>
              <AccordionItem
                question="How do I request a change or cancellation?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <FaqChangeOrCancelAnswer live={bookingLive} />
              </AccordionItem>
            </div>
          </section>

          <section id="before-arrival" className="scroll-mt-36">
            <TopicHeading index="04" title="Before You Arrive" aside="Preparation" />
            <div className="space-y-space-sm">
              <AccordionItem
                question="What should I know before visiting?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  The barrel cellar stays cool, around 10°C–12°C, so a warm layer
                  is useful even in spring. Route times, parking, and the address
                  are on the{" "}
                  <Link href="/visit" className="font-medium text-primary underline underline-offset-4">
                    Visit Us guide
                  </Link>
                  . Service is {diningHours.hours}, {diningHours.openDays}.
                </p>
              </AccordionItem>
              <AccordionItem
                question="How can I ask about dietary requirements or accessibility?"
                questionClassName="font-title-editorial text-title-editorial font-medium"
              >
                <p>
                  Add dietary or access notes on the{" "}
                  <Link href="/book" className="font-medium text-primary underline underline-offset-4">
                    booking form
                  </Link>{" "}
                  if you are preparing a request, and tell the farm directly by
                  phone or email. The form itself is not delivered to the cellar.
                  Contact details are on{" "}
                  <Link href="/visit" className="font-medium text-primary underline underline-offset-4">
                    Visit Us
                  </Link>
                  .
                </p>
              </AccordionItem>
            </div>
          </section>
        </SiteContainer>
      </div>
    </>
  );
}

function TopicHeading({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside: string;
}) {
  return (
    <div className="mb-space-md flex items-baseline justify-between gap-space-md">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-label-sm text-label-sm text-on-primary">
          {index}
        </span>
        <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
      </div>
      <p className="hidden font-label-sm text-label-sm tracking-widest text-secondary uppercase sm:block">
        {aside}
      </p>
    </div>
  );
}
