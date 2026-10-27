export type StaffMutationErrorCode =
  | "validation"
  | "not_found"
  | "conflict"
  | "forbidden"
  | "unavailable"
  | "server";

export type StaffMutationError = {
  code: StaffMutationErrorCode;
  message: string;
};

const defaultMessages: Record<StaffMutationErrorCode, string> = {
  validation: "Check the reservation details and try again.",
  not_found: "That reservation could not be found.",
  conflict: "This reservation was updated elsewhere. Refresh and try again.",
  forbidden: "You do not have permission to update this reservation.",
  unavailable: "That change is not allowed for the current service slot.",
  server: "Could not save the change. Try again in a moment.",
};

export function staffMutationError(
  code: StaffMutationErrorCode,
  message?: string,
): StaffMutationError {
  return {
    code,
    message: message ?? defaultMessages[code],
  };
}

export function mapReservationMutationPostgresMessage(
  raw: string | undefined,
): StaffMutationError {
  const message = (raw ?? "").toLowerCase();

  if (
    message.includes("service is not bookable") ||
    message.includes("service is full") ||
    message.includes("closure overlaps")
  ) {
    return staffMutationError("unavailable");
  }
  if (message.includes("reservation details are changed from the server")) {
    return staffMutationError("validation", "Only status and notes can be changed here.");
  }
  if (message.includes("permission denied") || message.includes("42501")) {
    return staffMutationError("forbidden");
  }

  return staffMutationError("server");
}

export function mapReservationMutationSupabaseError(error: {
  message?: string;
  code?: string;
}): StaffMutationError {
  if (error.code === "PGRST116") {
    return staffMutationError("not_found");
  }
  if (error.code === "42501") {
    return staffMutationError("forbidden");
  }

  return mapReservationMutationPostgresMessage(error.message);
}
