import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReservationStatus } from "@/lib/staff/types";
import { reservationStatuses } from "@/lib/staff/types";

export type AdminCustomerRow = {
  guestId: string;
  displayName: string;
  email: string;
  phone: string;
  reservationCount: number;
  completedVisits: number;
  lastServiceDate: string | null;
};

export type AdminCustomerDetail = AdminCustomerRow & {
  reservations: Array<{
    id: string;
    serviceDate: string;
    arrivalTime: string;
    partySize: number;
    status: ReservationStatus;
    notes: string | null;
  }>;
};

function isReservationStatus(value: string): value is ReservationStatus {
  return (reservationStatuses as readonly string[]).includes(value);
}

export async function loadAdminCustomers(
  supabase: SupabaseClient,
  searchQuery?: string,
): Promise<{ rows: AdminCustomerRow[]; error: string | null }> {
  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("id, display_name, guest_contacts ( email, phone )")
    .order("display_name", { ascending: true })
    .limit(500);

  if (guestsError) {
    return { rows: [], error: "Could not load customers." };
  }

  const guestIds = (guests ?? []).map((g) => g.id as string);
  if (guestIds.length === 0) {
    return { rows: [], error: null };
  }

  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("guest_id, service_date, status")
    .in("guest_id", guestIds);

  if (reservationsError) {
    return { rows: [], error: "Could not load reservation history for customers." };
  }

  const stats = new Map<
    string,
    { count: number; completed: number; lastDate: string | null }
  >();

  for (const row of reservations ?? []) {
    const guestId = row.guest_id as string;
    const current = stats.get(guestId) ?? {
      count: 0,
      completed: 0,
      lastDate: null,
    };
    current.count += 1;
    if (row.status === "completed") {
      current.completed += 1;
    }
    const serviceDate = row.service_date as string;
    if (!current.lastDate || serviceDate > current.lastDate) {
      current.lastDate = serviceDate;
    }
    stats.set(guestId, current);
  }

  const needle = searchQuery?.trim().toLowerCase() ?? "";

  const rows: AdminCustomerRow[] = (guests ?? []).flatMap((guest) => {
    const contacts = guest.guest_contacts as
      | { email: string; phone: string }
      | { email: string; phone: string }[]
      | null;
    const contact = Array.isArray(contacts) ? contacts[0] : contacts;
    const email = contact?.email ?? "";
    const phone = contact?.phone ?? "";
    const displayName = guest.display_name as string;
    const guestId = guest.id as string;
    const guestStats = stats.get(guestId) ?? {
      count: 0,
      completed: 0,
      lastDate: null,
    };

    if (needle) {
      const haystack = `${displayName} ${email} ${phone}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return [];
      }
    }

    return [
      {
        guestId,
        displayName,
        email,
        phone,
        reservationCount: guestStats.count,
        completedVisits: guestStats.completed,
        lastServiceDate: guestStats.lastDate,
      },
    ];
  });

  return { rows, error: null };
}

export async function loadAdminCustomerDetail(
  supabase: SupabaseClient,
  guestId: string,
): Promise<{ detail: AdminCustomerDetail | null; error: string | null }> {
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id, display_name, guest_contacts ( email, phone )")
    .eq("id", guestId)
    .maybeSingle();

  if (guestError || !guest) {
    return { detail: null, error: "Customer not found." };
  }

  const contacts = guest.guest_contacts as
    | { email: string; phone: string }
    | { email: string; phone: string }[]
    | null;
  const contact = Array.isArray(contacts) ? contacts[0] : contacts;

  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select("id, service_date, arrival_time, party_size, status, notes")
    .eq("guest_id", guestId)
    .order("service_date", { ascending: false })
    .order("arrival_time", { ascending: false });

  if (reservationsError) {
    return { detail: null, error: "Could not load reservation history." };
  }

  let completedVisits = 0;
  let lastServiceDate: string | null = null;
  const mappedReservations = (reservations ?? []).flatMap((row) => {
    const status = row.status as string;
    if (!isReservationStatus(status)) {
      return [];
    }
    if (status === "completed") {
      completedVisits += 1;
    }
    const serviceDate = row.service_date as string;
    if (!lastServiceDate || serviceDate > lastServiceDate) {
      lastServiceDate = serviceDate;
    }
    return [
      {
        id: row.id as string,
        serviceDate,
        arrivalTime: row.arrival_time as string,
        partySize: row.party_size as number,
        status,
        notes: (row.notes as string | null) ?? null,
      },
    ];
  });

  return {
    detail: {
      guestId: guest.id as string,
      displayName: guest.display_name as string,
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      reservationCount: mappedReservations.length,
      completedVisits,
      lastServiceDate,
      reservations: mappedReservations,
    },
    error: null,
  };
}
