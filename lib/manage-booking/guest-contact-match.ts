import { isValidEmail, isValidPhone, phoneDigits } from "@/lib/service-calendar";

export type StoredGuestContact = {
  email: string;
  phone: string;
};

export function normalizeGuestEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Match submitted email or phone against stored guest_contacts (server-side only). */
export function guestContactMatches(
  submittedContact: string,
  stored: StoredGuestContact,
): boolean {
  const trimmed = submittedContact.trim();

  if (isValidEmail(trimmed)) {
    return normalizeGuestEmail(trimmed) === stored.email;
  }

  if (isValidPhone(trimmed)) {
    const submittedDigits = phoneDigits(trimmed);
    const storedDigits = phoneDigits(stored.phone);
    if (submittedDigits === storedDigits) {
      return true;
    }
    const shorter =
      submittedDigits.length <= storedDigits.length ? submittedDigits : storedDigits;
    const longer =
      submittedDigits.length > storedDigits.length ? submittedDigits : storedDigits;
    return shorter.length >= 8 && longer.endsWith(shorter);
  }

  return false;
}
