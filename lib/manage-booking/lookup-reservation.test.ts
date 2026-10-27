import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import { lookupGuestReservation } from "@/lib/manage-booking/lookup-reservation";

const reservationId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const reference = formatReservationReference(reservationId);

function mockSupabase(options: {
  reservations: unknown[] | null;
  reservationsError?: boolean;
  contact?: { email: string; phone: string } | null;
  contactError?: boolean;
}) {
  return {
    from(table: string) {
      if (table === "reservations") {
        return {
          select: () => ({
            ilike: async () => {
              if (options.reservationsError) {
                return { data: null, error: { message: "db" } };
              }
              return { data: options.reservations ?? [], error: null };
            },
          }),
        };
      }
      if (table === "guest_contacts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => {
                if (options.contactError) {
                  return { data: null, error: { message: "db" } };
                }
                return { data: options.contact ?? null, error: null };
              },
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  } as unknown as SupabaseClient;
}

const baseReservation = {
  id: reservationId,
  guest_id: "guest-1",
  service_date: "2026-11-06",
  arrival_time: "13:30:00",
  adult_count: 2,
  child_count: 0,
  party_size: 2,
  status: "confirmed",
  notes: null,
  updated_at: "2026-01-01T12:00:00.000Z",
  guests: { display_name: "Guest Name" },
  service_shifts: { name: "Lunch" },
  table_assignments: [
    {
      released_at: null,
      restaurant_tables: { label: "Table 1" },
    },
  ],
};

describe("lookupGuestReservation", () => {
  it("returns null for invalid reference format", async () => {
    const result = await lookupGuestReservation(mockSupabase({ reservations: [] }), {
      reference: "BAD",
      contact: "guest@example.com",
    });
    expect(result).toBeNull();
  });

  it("returns null when contact does not match", async () => {
    const result = await lookupGuestReservation(
      mockSupabase({
        reservations: [baseReservation],
        contact: { email: "other@example.com", phone: "+34 600 000 000" },
      }),
      { reference, contact: "guest@example.com" },
    );
    expect(result).toBeNull();
  });

  it("returns summary when reference and contact match", async () => {
    const result = await lookupGuestReservation(
      mockSupabase({
        reservations: [baseReservation],
        contact: { email: "guest@example.com", phone: "+34 945 123 456" },
      }),
      { reference, contact: "guest@example.com" },
    );

    expect(result?.reservationId).toBe(reservationId);
    expect(result?.summary.reference).toBe(reference);
    expect(result?.summary.guestDisplayName).toBe("Guest Name");
    expect(result?.summary.canCancel).toBe(true);
    expect(result?.summary.tableLabels).toEqual(["Table 1"]);
  });

  it("returns null when no reservation rows are returned", async () => {
    const result = await lookupGuestReservation(
      mockSupabase({
        reservations: [],
        contact: { email: "guest@example.com", phone: "" },
      }),
      { reference, contact: "guest@example.com" },
    );
    expect(result).toBeNull();
  });
});
