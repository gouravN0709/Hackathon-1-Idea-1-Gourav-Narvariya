import { formatReservationReference } from "@/lib/booking/reference";

export function normalizeReferenceQuery(query: string): string {
  return query.trim().toUpperCase().replace(/\s+/g, "");
}

/** Match guest-facing reference (ITU- prefix) against a reservation id. */
export function reservationMatchesReference(
  reservationId: string,
  query: string,
): boolean {
  const normalized = normalizeReferenceQuery(query);
  if (!normalized) {
    return true;
  }

  const reference = formatReservationReference(reservationId);
  if (reference === normalized) {
    return true;
  }

  const withoutPrefix = normalized.startsWith("ITU-")
    ? normalized.slice(4)
    : normalized;

  const compactId = reservationId.replace(/-/g, "").toUpperCase();
  return compactId.startsWith(withoutPrefix);
}
