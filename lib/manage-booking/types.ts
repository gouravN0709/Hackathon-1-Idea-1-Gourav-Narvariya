import type { ReservationStatus } from "@/lib/staff/types";

export type GuestReservationSummary = {
  reference: string;
  guestDisplayName: string;
  serviceDate: string;
  serviceDateLabel: string;
  arrivalTime: string;
  adultCount: number;
  childCount: number;
  partySize: number;
  status: ReservationStatus;
  shiftName: string | null;
  tableLabels: string[];
  canCancel: boolean;
  cancelBlockedReason: string | null;
  updatedAt: string;
};
