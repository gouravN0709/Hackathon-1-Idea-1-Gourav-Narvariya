export type BookingErrorCode =
  | "validation"
  | "unavailable"
  | "full"
  | "tables"
  | "configuration"
  | "server";

export type BookingError = {
  code: BookingErrorCode;
  message: string;
};

const safeMessages: Record<BookingErrorCode, string> = {
  validation: "Check the form and try again.",
  unavailable: "That date or arrival time is not open for booking.",
  full: "This service is full. Choose another date or call the farm.",
  tables: "No table layout is available for your party size right now.",
  configuration: "Online booking is not available yet.",
  server: "We could not save your request. Try again or call the farm.",
};

export function bookingError(code: BookingErrorCode, message?: string): BookingError {
  return {
    code,
    message: message ?? safeMessages[code],
  };
}

export function mapPostgresMessage(raw: string | undefined): BookingError {
  const message = (raw ?? "").toLowerCase();

  if (message.includes("service is not bookable")) {
    return bookingError("unavailable");
  }
  if (message.includes("service is full")) {
    return bookingError("full");
  }
  if (
    message.includes("table is not available") ||
    message.includes("table is already assigned") ||
    message.includes("tables do not cover the party")
  ) {
    return bookingError("tables");
  }
  if (message.includes("reservation could not be saved")) {
    return bookingError("validation");
  }
  if (message.includes("reservation changes are server-only")) {
    return bookingError("configuration");
  }

  return bookingError("server");
}

export function mapSupabaseError(error: { message?: string; code?: string }): BookingError {
  if (error.code === "PGRST202" || error.message?.includes("Could not find the function")) {
    return bookingError(
      "configuration",
      "The reservation database is not ready for this site yet.",
    );
  }

  return mapPostgresMessage(error.message);
}
