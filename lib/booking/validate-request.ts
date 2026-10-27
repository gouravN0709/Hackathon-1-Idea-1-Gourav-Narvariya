import {
  isValidEmail,
  isValidPhone,
  serviceDateError,
} from "@/lib/service-calendar";
import {
  defaultValidationMessages,
  type ValidationMessages,
} from "@/lib/validation-messages";
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

function resolveMessages(messages?: Partial<ValidationMessages>): ValidationMessages {
  const adultsRange =
    messages?.adultsRange ??
    defaultValidationMessages.adultsRange(adultMin, adultMax);
  const childrenRange =
    messages?.childrenRange ??
    defaultValidationMessages.childrenRange(childMin, childMax);

  return {
    chooseArrivalDate:
      messages?.chooseArrivalDate ?? defaultValidationMessages.chooseArrivalDate,
    datePast: messages?.datePast ?? defaultValidationMessages.datePast,
    closedWeekdays:
      messages?.closedWeekdays ?? defaultValidationMessages.closedWeekdays,
    chooseArrivalTime:
      messages?.chooseArrivalTime ?? defaultValidationMessages.chooseArrivalTime,
    adultsRange,
    childrenRange,
    nameRequired:
      messages?.nameRequired ?? defaultValidationMessages.nameRequired,
    emailInvalid:
      messages?.emailInvalid ?? defaultValidationMessages.emailInvalid,
    phoneInvalid:
      messages?.phoneInvalid ?? defaultValidationMessages.phoneInvalid,
    notesMax: messages?.notesMax ?? defaultValidationMessages.notesMax,
  };
}

export function validateBookingRequest(
  input: BookingRequestInput,
  messages?: Partial<ValidationMessages>,
): { ok: true; value: ValidatedBookingRequest } | { ok: false; errors: Record<string, string> } {
  const m = resolveMessages(messages);
  const errors: Record<string, string> = {};
  const dateMessage = serviceDateError(input.date, {
    chooseArrivalDate: m.chooseArrivalDate,
    datePast: m.datePast,
    closedWeekdays: m.closedWeekdays,
  });
  if (dateMessage) {
    errors.date = dateMessage;
  }
  if (!arrivalTimes.includes(input.arrival as ArrivalTime)) {
    errors.arrival = m.chooseArrivalTime;
  }
  if (!Number.isInteger(input.adults) || input.adults < adultMin || input.adults > adultMax) {
    errors.adults = m.adultsRange;
  }
  if (
    !Number.isInteger(input.children) ||
    input.children < childMin ||
    input.children > childMax
  ) {
    errors.children = m.childrenRange;
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const notes = input.notes.trim();

  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name)) {
    errors.name = m.nameRequired;
  }
  if (!isValidEmail(email)) {
    errors.email = m.emailInvalid;
  }
  if (!isValidPhone(phone)) {
    errors.phone = m.phoneInvalid;
  }
  if (notes.length > 800) {
    errors.notes = m.notesMax;
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
