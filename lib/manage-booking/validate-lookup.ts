import { isValidEmail, isValidPhone } from "@/lib/service-calendar";
import { normalizeReferenceQuery } from "@/lib/staff/reference-match";

/** Full guest-facing reference: ITU- plus the first 10 hex digits of the reservation id. */
export const GUEST_REFERENCE_PATTERN = /^ITU-[0-9A-F]{10}$/;

export type GuestLookupInput = {
  reference: string;
  contact: string;
};

export function normalizeGuestLookupInput(input: GuestLookupInput): GuestLookupInput {
  return {
    reference: normalizeReferenceQuery(input.reference),
    contact: input.contact.trim(),
  };
}

export function validateGuestLookupInput(
  input: GuestLookupInput,
): { ok: true; value: GuestLookupInput } | { ok: false } {
  const normalized = normalizeGuestLookupInput(input);

  if (!GUEST_REFERENCE_PATTERN.test(normalized.reference)) {
    return { ok: false };
  }
  if (!isValidEmail(normalized.contact) && !isValidPhone(normalized.contact)) {
    return { ok: false };
  }

  return { ok: true, value: normalized };
}

/** Client-side field errors (does not reveal whether a booking exists). */
export function guestLookupFieldErrors(input: GuestLookupInput): Record<string, string> {
  const normalized = normalizeGuestLookupInput(input);
  const errors: Record<string, string> = {};

  if (!GUEST_REFERENCE_PATTERN.test(normalized.reference)) {
    errors.reference =
      "Enter your booking reference exactly as shown (ITU- followed by 10 letters or numbers).";
  }
  if (!isValidEmail(normalized.contact) && !isValidPhone(normalized.contact)) {
    errors.contact = "Enter the email address or telephone number used when booking.";
  }

  return errors;
}
