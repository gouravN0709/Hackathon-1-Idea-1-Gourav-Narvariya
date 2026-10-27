export const reservationStatuses = [
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];

export type StaffRole = "owner" | "manager" | "staff";

export type StaffReservationRow = {
  id: string;
  reference: string;
  guestDisplayName: string;
  serviceDate: string;
  arrivalTime: string;
  adultCount: number;
  childCount: number;
  partySize: number;
  status: ReservationStatus;
  tableLabels: string[];
  notes: string | null;
  shiftName: string | null;
  updatedAt: string;
};

export type StaffForbiddenReason =
  | "profile_lookup_failed"
  | "no_profile"
  | "inactive_profile"
  | "invalid_role";

export type StaffAccess =
  | { kind: "configuration_missing"; message: string }
  | { kind: "signed_out" }
  | {
      kind: "forbidden";
      reason: StaffForbiddenReason;
      message: string;
    }
  | {
      kind: "staff";
      userId: string;
      role: StaffRole;
      displayName: string;
    };
