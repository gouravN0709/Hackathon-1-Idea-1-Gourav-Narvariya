/** Validates IANA timezone names using the runtime Intl database (matches DB trigger intent). */
export function isSupportedIanaTimezone(timezone: string): boolean {
  const trimmed = timezone.trim();
  if (trimmed.length < 1 || trimmed.length > 64) {
    return false;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

export type BusinessTimezoneInput = {
  timezone: string;
};

export type ValidateBusinessTimezoneResult =
  | { ok: true; value: { timezone: string } }
  | { ok: false; message: string };

export function validateBusinessTimezoneInput(
  input: BusinessTimezoneInput,
): ValidateBusinessTimezoneResult {
  const timezone = input.timezone.trim();
  if (!timezone) {
    return { ok: false, message: "Choose a timezone." };
  }
  if (!isSupportedIanaTimezone(timezone)) {
    return {
      ok: false,
      message: "Timezone must be a recognized IANA name (for example Europe/Madrid).",
    };
  }
  return { ok: true, value: { timezone } };
}
