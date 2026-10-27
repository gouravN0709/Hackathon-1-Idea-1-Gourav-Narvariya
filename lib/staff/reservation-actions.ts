import type { ReservationStatus } from "@/lib/staff/types";

/**
 * Database rules for staff reservation updates (migration
 * `20261026184605_restaurant_operations.sql`):
 *
 * - Authenticated staff may UPDATE only `status`, `notes`, `cancelled_at`, and
 *   `updated_at` on `public.reservations` (RLS + column grants).
 * - Changing guest, date, shift, arrival time, or party size via UPDATE is
 *   rejected unless the session uses `service_role` (`private.prepare_reservation`).
 * - `cancelled_at` is maintained by trigger from status (`private.prepare_reservation`).
 * - Moving from a capacity-holding status to `cancelled` or `no_show` releases
 *   active table assignments (`private.release_tables_when_reservation_ends`).
 * - Capacity-holding statuses: pending, confirmed, seated, completed
 *   (`private.reservation_holds_capacity`).
 * - Reinstatement from terminal statuses re-runs slot and capacity checks.
 *
 * No migration adds a dedicated RPC for confirm/cancel; staff DML must respect
 * these triggers. Table reassignment remains service_role-only
 * (`public.assign_reservation_tables`).
 */

export type StaffReservationActionId =
  | "confirm"
  | "mark_seated"
  | "mark_completed"
  | "cancel"
  | "mark_no_show"
  | "edit_notes";

export type StaffReservationAction = {
  id: StaffReservationActionId;
  label: string;
  targetStatus?: ReservationStatus;
  implemented: boolean;
  detail: string;
};

export function proposedReservationActions(
  currentStatus: ReservationStatus,
): StaffReservationAction[] {
  const actions: StaffReservationAction[] = [
    {
      id: "edit_notes",
      label: "Edit notes",
      implemented: true,
      detail: "Replace staff notes for this reservation (800 characters max).",
    },
  ];

  if (currentStatus === "pending") {
    actions.unshift(
      {
        id: "confirm",
        label: "Confirm",
        targetStatus: "confirmed",
        implemented: true,
        detail: "Mark this pending reservation as confirmed.",
      },
      {
        id: "cancel",
        label: "Cancel",
        targetStatus: "cancelled",
        implemented: true,
        detail: "Cancel with a required note appended to existing notes.",
      },
    );
  }

  if (currentStatus === "confirmed") {
    actions.unshift(
      {
        id: "mark_seated",
        label: "Mark seated",
        targetStatus: "seated",
        implemented: true,
        detail: "Guest has arrived and is seated.",
      },
      {
        id: "cancel",
        label: "Cancel",
        targetStatus: "cancelled",
        implemented: true,
        detail: "Cancel with a required note appended to existing notes.",
      },
      {
        id: "mark_no_show",
        label: "No show",
        targetStatus: "no_show",
        implemented: true,
        detail: "Record a no-show with a required note appended to existing notes.",
      },
    );
  }

  if (currentStatus === "seated") {
    actions.unshift(
      {
        id: "mark_completed",
        label: "Complete",
        targetStatus: "completed",
        implemented: true,
        detail: "Mark the meal or visit as completed.",
      },
      {
        id: "mark_no_show",
        label: "No show",
        targetStatus: "no_show",
        implemented: true,
        detail: "Record a no-show with a required note appended to existing notes.",
      },
    );
  }

  if (currentStatus === "completed") {
    actions.unshift({
      id: "cancel",
      label: "Cancel (adjustment)",
      targetStatus: "cancelled",
      implemented: false,
      detail:
        "Schema allows this transition but capacity accounting must be reviewed before enabling.",
    });
  }

  if (currentStatus === "cancelled" || currentStatus === "no_show") {
    actions.unshift({
      id: "confirm",
      label: "Reinstate as confirmed",
      targetStatus: "confirmed",
      implemented: false,
      detail:
        "Reopening checks slot availability and capacity via triggers; not enabled in this phase.",
    });
  }

  return actions;
}
