import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

export type DailySlotSummary = {
  arrivalTime: string;
  shiftName: string | null;
  reservations: number;
  guests: number;
  byStatus: Record<ReservationStatus, number>;
};

export type AdminDailyOperations = {
  serviceDate: string;
  totalReservations: number;
  totalGuests: number;
  slots: DailySlotSummary[];
  error: string | null;
};

function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

function singleRelation<T>(value: T | T[] | null): T | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function loadAdminDailyOperations(
  supabase: SupabaseClient,
  serviceDate: string,
): Promise<AdminDailyOperations> {
  const emptyByStatus = Object.fromEntries(
    reservationStatuses.map((s) => [s, 0]),
  ) as Record<ReservationStatus, number>;

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      arrival_time,
      party_size,
      status,
      service_shifts ( name )
    `,
    )
    .eq("service_date", serviceDate)
    .order("arrival_time", { ascending: true });

  if (error) {
    return {
      serviceDate,
      totalReservations: 0,
      totalGuests: 0,
      slots: [],
      error: "Could not load the daily service overview.",
    };
  }

  const slotMap = new Map<string, DailySlotSummary>();

  for (const row of data ?? []) {
    const status = row.status as string;
    if (!isReservationStatus(status)) {
      continue;
    }
    const arrivalTime = row.arrival_time as string;
    const shift = singleRelation(
      row.service_shifts as { name: string } | { name: string }[] | null,
    );
    const key = `${arrivalTime}:${shift?.name ?? ""}`;
    const current = slotMap.get(key) ?? {
      arrivalTime,
      shiftName: shift?.name ?? null,
      reservations: 0,
      guests: 0,
      byStatus: { ...emptyByStatus },
    };
    current.reservations += 1;
    current.guests += row.party_size as number;
    current.byStatus[status] += 1;
    slotMap.set(key, current);
  }

  const slots = [...slotMap.values()].sort((a, b) =>
    a.arrivalTime.localeCompare(b.arrivalTime),
  );

  const totalReservations = slots.reduce((sum, slot) => sum + slot.reservations, 0);
  const totalGuests = slots.reduce((sum, slot) => sum + slot.guests, 0);

  return {
    serviceDate,
    totalReservations,
    totalGuests,
    slots,
    error: null,
  };
}
