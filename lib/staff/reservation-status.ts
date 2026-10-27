import type { ReservationStatus } from "@/lib/staff/types";

/** Matches `private.reservation_holds_capacity` in the migration. */
export const capacityHoldingStatuses: ReservationStatus[] = [
  "pending",
  "confirmed",
  "seated",
  "completed",
];

export function statusHoldsCapacity(status: ReservationStatus): boolean {
  return (capacityHoldingStatuses as readonly string[]).includes(status);
}

export const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export function statusBadgeClass(status: ReservationStatus): string {
  switch (status) {
    case "pending":
      return "bg-surface-container-high text-on-surface-variant";
    case "confirmed":
      return "bg-primary-fixed text-on-primary-fixed-variant";
    case "seated":
      return "bg-secondary-fixed text-on-secondary-fixed-variant";
    case "completed":
      return "bg-surface-container text-on-surface";
    case "cancelled":
      return "bg-error-container text-on-error-container";
    case "no_show":
      return "bg-error-container text-on-error-container";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

/**
 * UI-only guidance for staff actions. The database does not enforce a transition
 * graph; triggers handle capacity, slot checks, and table release on UPDATE.
 */
export const suggestedNextStatuses: Partial<
  Record<ReservationStatus, ReservationStatus[]>
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["seated", "cancelled", "no_show"],
  seated: ["completed", "no_show"],
  completed: ["cancelled"],
  cancelled: ["confirmed"],
  no_show: ["confirmed"],
};
