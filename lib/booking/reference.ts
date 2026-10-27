/** Guest-facing reference derived from the reservation UUID (not used for public lookup). */
export function formatReservationReference(reservationId: string): string {
  const compact = reservationId.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `ITU-${compact}`;
}
