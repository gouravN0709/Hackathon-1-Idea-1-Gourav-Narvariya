"use client";

import { useHomeBookingCtaNote } from "@/lib/booking/customer-copy";

export function BookingCtaNote({ live }: { live: boolean }) {
  return useHomeBookingCtaNote(live);
}
