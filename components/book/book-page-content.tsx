import { connection } from "next/server";
import { BookAssistance } from "@/components/book/book-assistance";
import { BookExpect } from "@/components/book/book-expect";
import { BookHero } from "@/components/book/book-hero";
import { BookingAside } from "@/components/book/booking-aside";
import { BookingForm } from "@/components/book/booking-form";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { SiteContainer } from "@/components/ui/site-container";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";

export async function BookPageContent() {
  await connection();
  const readiness = await getPublicBookingReadiness();

  return (
    <>
      <PageBreadcrumb
        current="Table reservations · Caserío Goikola"
        note={
          readiness.live
            ? "Online requests · reference on confirm"
            : "Prototype form · no reservation is sent"
        }
      />
      <BookHero bookingLive={readiness.live} />
      <section className="w-full bg-surface-container-low py-space-2xl">
        <SiteContainer>
          <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12">
            <div className="lg:col-span-7">
              <BookingForm />
            </div>
            <div className="lg:col-span-5">
              <BookingAside />
            </div>
          </div>
        </SiteContainer>
      </section>
      <BookExpect />
      <BookAssistance />
    </>
  );
}

export function BookPageFallback() {
  return (
    <>
      <PageBreadcrumb
        current="Table reservations · Caserío Goikola"
        note="Checking booking availability…"
      />
      <section className="w-full bg-surface py-space-xl">
        <SiteContainer>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Loading reservation form…
          </p>
        </SiteContainer>
      </section>
    </>
  );
}
