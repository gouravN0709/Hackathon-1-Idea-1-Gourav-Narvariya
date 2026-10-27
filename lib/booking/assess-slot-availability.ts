import type { SupabaseClient } from "@supabase/supabase-js";
import { assessBookingReadiness } from "@/lib/booking/readiness";
import { resolveShiftIdForBooking } from "@/lib/booking/resolve-shift";
import {
  checkBookingClosedForShift,
  CLOSURE_BOOKING_MESSAGE,
} from "@/lib/booking/special-closure";
import type { ArrivalTime } from "@/lib/booking/constants";
import { serviceDateError } from "@/lib/service-calendar";
import { arrivalTimes } from "@/lib/booking/constants";

export type SlotAvailabilityResult =
  | { bookable: true }
  | { bookable: false; message: string };

export async function assessBookingSlotAvailability(
  supabase: SupabaseClient,
  serviceDate: string,
  arrival: string,
): Promise<SlotAvailabilityResult> {
  const dateMessage = serviceDateError(serviceDate);
  if (dateMessage) {
    return { bookable: false, message: dateMessage };
  }

  if (!arrivalTimes.includes(arrival as ArrivalTime)) {
    return { bookable: false, message: "Choose an arrival time." };
  }

  const readiness = await assessBookingReadiness(supabase);
  if (!readiness.live) {
    return {
      bookable: false,
      message: readiness.reason ?? "Online booking is not available yet.",
    };
  }

  const shiftId = await resolveShiftIdForBooking(
    supabase,
    serviceDate,
    arrival as ArrivalTime,
  );
  if (!shiftId) {
    return {
      bookable: false,
      message: "That date or arrival time is not open for booking.",
    };
  }

  const closure = await checkBookingClosedForShift(supabase, serviceDate, shiftId);
  if (closure === "closed") {
    return { bookable: false, message: CLOSURE_BOOKING_MESSAGE };
  }

  return { bookable: true };
}
