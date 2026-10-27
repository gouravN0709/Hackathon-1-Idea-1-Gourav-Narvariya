import { connection } from "next/server";
import { BookingCtaSection } from "@/components/home/booking-cta-section";
import { homeBookingCtaNote } from "@/lib/booking/customer-copy";
import { getPublicBookingReadiness } from "@/lib/booking/public-readiness";

export async function BookingCtaWithReadiness() {
  await connection();
  const readiness = await getPublicBookingReadiness();
  return <BookingCtaSection bookingNote={homeBookingCtaNote(readiness.live)} />;
}

export function BookingCtaFallback() {
  return <BookingCtaSection bookingNote={homeBookingCtaNote(false)} />;
}
