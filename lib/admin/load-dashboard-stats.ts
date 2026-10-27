import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

const CAPACITY_HOLDING_STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "seated",
  "completed",
];

export type AdminDashboardStats = {
  serviceDate: string;
  countsByStatus: Record<ReservationStatus, number>;
  reservationsToday: number;
  guestsExpectedToday: number;
  upcomingCount: number;
  upcomingGuests: number;
  capacityToday: { maxCovers: number; reservedCovers: number } | null;
  recentReservations: Array<{
    id: string;
    guestDisplayName: string;
    serviceDate: string;
    arrivalTime: string;
    partySize: number;
    status: ReservationStatus;
  }>;
  alerts: string[];
  error: string | null;
};

type ReservationRow = {
  id: string;
  service_date: string;
  arrival_time: string;
  party_size: number;
  status: string;
  created_at: string;
  guests: { display_name: string } | { display_name: string }[] | null;
};

function singleRelation<T>(value: T | T[] | null): T | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function madridToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

export async function loadAdminDashboardStats(
  supabase: SupabaseClient,
  serviceDate: string = madridToday(),
): Promise<AdminDashboardStats> {
  const emptyCounts = Object.fromEntries(
    reservationStatuses.map((status) => [status, 0]),
  ) as Record<ReservationStatus, number>;

  const [reservationsResult, capacityResult] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        `
        id,
        service_date,
        arrival_time,
        party_size,
        status,
        created_at,
        guests ( display_name )
      `,
      )
      .gte("service_date", serviceDate)
      .order("service_date", { ascending: true })
      .order("arrival_time", { ascending: true })
      .limit(500),
    supabase
      .from("service_capacity")
      .select("max_covers, reserved_covers")
      .eq("service_date", serviceDate),
  ]);

  if (reservationsResult.error) {
    return {
      serviceDate,
      countsByStatus: emptyCounts,
      reservationsToday: 0,
      guestsExpectedToday: 0,
      upcomingCount: 0,
      upcomingGuests: 0,
      capacityToday: null,
      recentReservations: [],
      alerts: [],
      error: "Could not load reservation statistics.",
    };
  }

  const rows = (reservationsResult.data ?? []) as ReservationRow[];
  const countsByStatus = { ...emptyCounts };
  let reservationsToday = 0;
  let guestsExpectedToday = 0;
  let upcomingCount = 0;
  let upcomingGuests = 0;

  for (const row of rows) {
    if (!isReservationStatus(row.status)) {
      continue;
    }
    countsByStatus[row.status] += 1;

    if (row.service_date === serviceDate) {
      reservationsToday += 1;
      if (CAPACITY_HOLDING_STATUSES.includes(row.status)) {
        guestsExpectedToday += row.party_size;
      }
    } else if (row.service_date > serviceDate) {
      upcomingCount += 1;
      if (CAPACITY_HOLDING_STATUSES.includes(row.status)) {
        upcomingGuests += row.party_size;
      }
    }
  }

  let capacityToday: AdminDashboardStats["capacityToday"] = null;
  if (!capacityResult.error && capacityResult.data?.length) {
    const maxCovers = capacityResult.data.reduce(
      (sum, row) => sum + (row.max_covers as number),
      0,
    );
    const reservedCovers = capacityResult.data.reduce(
      (sum, row) => sum + (row.reserved_covers as number),
      0,
    );
    capacityToday = { maxCovers, reservedCovers };
  }

  const alerts: string[] = [];
  if (countsByStatus.pending > 0) {
    alerts.push(
      `${countsByStatus.pending} reservation${countsByStatus.pending === 1 ? "" : "s"} awaiting confirmation.`,
    );
  }
  if (capacityToday && capacityToday.reservedCovers >= capacityToday.maxCovers) {
    alerts.push("Today's cover capacity is fully booked.");
  } else if (
    capacityToday &&
    capacityToday.maxCovers > 0 &&
    capacityToday.reservedCovers / capacityToday.maxCovers >= 0.9
  ) {
    alerts.push("Today's cover capacity is above 90%.");
  }

  const recentReservations = [...rows]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 8)
    .flatMap((row) => {
      if (!isReservationStatus(row.status)) {
        return [];
      }
      const guest = singleRelation(row.guests);
      return [
        {
          id: row.id,
          guestDisplayName: guest?.display_name ?? "Guest",
          serviceDate: row.service_date,
          arrivalTime: row.arrival_time,
          partySize: row.party_size,
          status: row.status,
        },
      ];
    });

  return {
    serviceDate,
    countsByStatus,
    reservationsToday,
    guestsExpectedToday,
    upcomingCount,
    upcomingGuests,
    capacityToday,
    recentReservations,
    alerts,
    error: null,
  };
}
