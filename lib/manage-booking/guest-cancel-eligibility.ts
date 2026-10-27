import type { ReservationStatus } from "@/lib/staff/types";

/** Guest self-service may cancel only before the party is seated. */
export const guestCancellableStatuses: ReservationStatus[] = ["pending", "confirmed"];

export function guestCanCancelStatus(status: ReservationStatus): boolean {
  return (guestCancellableStatuses as readonly string[]).includes(status);
}

export function guestCancelBlockedReason(status: ReservationStatus): string | null {
  if (status === "cancelled") {
    return "This reservation is already cancelled.";
  }
  if (status === "no_show") {
    return "This reservation was marked as a no-show. Call the farm if you need help.";
  }
  if (status === "completed") {
    return "This visit has already been completed.";
  }
  if (status === "seated") {
    return "Your party is already seated. Please speak with staff at the farm to cancel.";
  }
  if (!guestCanCancelStatus(status)) {
    return "This reservation cannot be cancelled online.";
  }
  return null;
}
