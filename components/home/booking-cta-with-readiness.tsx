import { connection } from "next/server";
import { BookingCtaSection } from "@/components/home/booking-cta-section";
import { BookingCtaNote } from "@/components/home/booking-cta-note";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";

export async function BookingCtaWithReadiness() {
  await connection();
  const readiness = await getPublicBookingReadiness();
  return (
    <BookingCtaSection bookingNote={<BookingCtaNote live={readiness.live} />} />
  );
}

export function BookingCtaFallback() {
  return <BookingCtaSection bookingNote={<BookingCtaNote live={false} />} />;
}
