import {
  isValidEmail,
  isValidPhone,
  serviceDateError,
} from "@/lib/service-calendar";
import {
  adultMax,
  adultMin,
  arrivalTimes,
  childMax,
  childMin,
  type ArrivalTime,
} from "@/lib/booking/constants";

export type BookingRequestInput = {
  date: string;
  arrival: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type ValidatedBookingRequest = BookingRequestInput & {
  arrival: ArrivalTime;
  partySize: number;
};

export function validateBookingRequest(
  input: BookingRequestInput,
): { ok: true; value: ValidatedBookingRequest } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const dateMessage = serviceDateError(input.date);
  if (dateMessage) {
    errors.date = dateMessage;
  }
  if (!arrivalTimes.includes(input.arrival as ArrivalTime)) {
    errors.arrival = "Choose an arrival time.";
  }
  if (!Number.isInteger(input.adults) || input.adults < adultMin || input.adults > adultMax) {
    errors.adults = `Adults must be between ${adultMin} and ${adultMax}.`;
  }
  if (
    !Number.isInteger(input.children) ||
    input.children < childMin ||
    input.children > childMax
  ) {
    errors.children = `Children must be between ${childMin} and ${childMax}.`;
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const notes = input.notes.trim();

  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name)) {
    errors.name = "Enter the name of the person making the request.";
  }
  if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!isValidPhone(phone)) {
    errors.phone = "Enter a telephone number with 8 to 15 digits.";
  }
  if (notes.length > 800) {
    errors.notes = "Keep notes to 800 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      date: input.date,
      arrival: input.arrival as ArrivalTime,
      adults: input.adults,
      children: input.children,
      name,
      email,
      phone,
      notes,
      partySize: input.adults + input.children,
    },
  };
}
