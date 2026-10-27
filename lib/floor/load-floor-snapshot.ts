import type { SupabaseClient } from "@supabase/supabase-js";
import { formatReservationReference } from "@/lib/booking/reference";
import { isTableOperationalStatus } from "@/lib/floor/table-status";
import type {
  FloorPlanTableRow,
  FloorReservationRow,
  FloorServiceSnapshot,
  RestaurantAreaRow,
  TableServiceStateRow,
  TableShape,
} from "@/lib/floor/types";

function singleRelation<T>(value: T | T[] | null): T | null {
  if (value == null) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function isTableShape(value: string): value is TableShape {
  return value === "rectangle" || value === "circle" || value === "square";
}

function schemaMissingFromError(message: string | undefined): boolean {
  if (!message) {
    return false;
  }
  const lower = message.toLowerCase();
  return (
    lower.includes("restaurant_areas") ||
    lower.includes("table_service_states") ||
    lower.includes("area_id") ||
    lower.includes("does not exist")
  );
}

export async function loadFloorServiceSnapshot(
  supabase: SupabaseClient,
  options: {
    serviceDate: string;
    shiftId?: string | null;
  },
): Promise<FloorServiceSnapshot> {
  const tableSelect =
    "id, label, seat_count, position_x, position_y, width, height, rotation_degrees, shape, is_active, sort_order, area_id";

  const [areasResult, tablesResult, shiftsResult] = await Promise.all([
    supabase
      .from("restaurant_areas")
      .select("id, name, sort_order, canvas_width, canvas_height")
      .order("sort_order", { ascending: true }),
    supabase.from("restaurant_tables").select(tableSelect).order("sort_order", { ascending: true }),
    supabase
      .from("service_shifts")
      .select("id, name, day_of_week, starts_at, ends_at, is_active")
      .order("day_of_week", { ascending: true })
      .order("starts_at", { ascending: true }),
  ]);

  if (
    schemaMissingFromError(areasResult.error?.message) ||
    schemaMissingFromError(tablesResult.error?.message)
  ) {
    const legacyTables = await supabase
      .from("restaurant_tables")
      .select("id, label, seat_count, is_active, sort_order")
      .order("sort_order", { ascending: true });

    const fallbackError = legacyTables.error?.message ?? null;
    const tables: FloorPlanTableRow[] = (legacyTables.data ?? []).map((row) => ({
      id: row.id as string,
      label: row.label as string,
      seat_count: row.seat_count as number,
      position_x: 0,
      position_y: 0,
      width: 80,
      height: 80,
      rotation_degrees: 0,
      shape: "rectangle",
      is_active: row.is_active as boolean,
      sort_order: row.sort_order as number,
      area_id: null,
    }));

    return {
      areas: [],
      tables,
      states: [],
      reservations: [],
      shifts: (shiftsResult.data ?? []) as FloorServiceSnapshot["shifts"],
      schemaReady: false,
      error: fallbackError,
    };
  }

  const firstError =
    areasResult.error?.message ??
    tablesResult.error?.message ??
    shiftsResult.error?.message ??
    null;

  const tablesRaw = (tablesResult.data ?? []) as Array<Record<string, unknown>>;
  const tables: FloorPlanTableRow[] = tablesRaw
    .map((row) => {
      const shape = String(row.shape ?? "rectangle");
      if (!isTableShape(shape)) {
        return null;
      }
      return {
        id: String(row.id),
        label: String(row.label),
        seat_count: Number(row.seat_count),
        position_x: Number(row.position_x),
        position_y: Number(row.position_y),
        width: Number(row.width),
        height: Number(row.height),
        rotation_degrees: Number(row.rotation_degrees),
        shape,
        is_active: Boolean(row.is_active),
        sort_order: Number(row.sort_order),
        area_id: row.area_id ? String(row.area_id) : null,
      };
    })
    .filter((row): row is FloorPlanTableRow => row != null);

  let states: TableServiceStateRow[] = [];
  if (options.shiftId) {
    const statesResult = await supabase
      .from("table_service_states")
      .select("table_id, operational_status, updated_at")
      .eq("service_date", options.serviceDate)
      .eq("shift_id", options.shiftId);

    if (!statesResult.error) {
      states = (statesResult.data ?? [])
        .map((row) => {
          const status = String(row.operational_status);
          if (!isTableOperationalStatus(status)) {
            return null;
          }
          return {
            table_id: String(row.table_id),
            operational_status: status,
            updated_at: String(row.updated_at),
          };
        })
        .filter((row): row is TableServiceStateRow => row != null);
    }
  }

  let reservations: FloorReservationRow[] = [];
  if (options.shiftId) {
    type ReservationQueryRow = {
      id: string;
      service_date: string;
      arrival_time: string;
      party_size: number;
      status: string;
      shift_id: string;
      updated_at: string;
      guests: { display_name: string } | { display_name: string }[] | null;
      service_shifts: { name: string } | { name: string }[] | null;
      table_assignments: Array<{
        table_id: string;
        released_at: string | null;
        restaurant_tables: { label: string } | { label: string }[] | null;
      }> | null;
    };

    const reservationsResult = await supabase
      .from("reservations")
      .select(
        `
        id,
        service_date,
        arrival_time,
        party_size,
        status,
        shift_id,
        updated_at,
        guests ( display_name ),
        service_shifts ( name ),
        table_assignments (
          table_id,
          released_at,
          restaurant_tables ( label )
        )
      `,
      )
      .eq("service_date", options.serviceDate)
      .eq("shift_id", options.shiftId)
      .order("arrival_time", { ascending: true });

    if (!reservationsResult.error) {
      reservations = ((reservationsResult.data ?? []) as ReservationQueryRow[]).map((row) => {
        const activeAssignments =
          row.table_assignments?.filter((a) => a.released_at == null) ?? [];
        const tableIds = activeAssignments.map((a) => a.table_id);
        const tableLabels = activeAssignments
          .map((a) => singleRelation(a.restaurant_tables)?.label)
          .filter((label): label is string => Boolean(label));
        const guest = singleRelation(row.guests);
        const shift = singleRelation(row.service_shifts);

        return {
          id: row.id,
          reference: formatReservationReference(row.id),
          guestDisplayName: guest?.display_name ?? "Guest",
          serviceDate: row.service_date,
          arrivalTime: row.arrival_time,
          partySize: row.party_size,
          status: row.status,
          shiftId: row.shift_id,
          shiftName: shift?.name ?? null,
          tableIds,
          tableLabels,
          updatedAt: row.updated_at,
        };
      });
    }
  }

  return {
    areas: (areasResult.data ?? []) as RestaurantAreaRow[],
    tables,
    states,
    reservations,
    shifts: (shiftsResult.data ?? []) as FloorServiceSnapshot["shifts"],
    schemaReady: true,
    error: firstError,
  };
}

export async function loadFloorPlanEditorSnapshot(
  supabase: SupabaseClient,
): Promise<{
  areas: RestaurantAreaRow[];
  tables: FloorPlanTableRow[];
  schemaReady: boolean;
  error: string | null;
}> {
  const snapshot = await loadFloorServiceSnapshot(supabase, {
    serviceDate: "1970-01-01",
    shiftId: null,
  });
  return {
    areas: snapshot.areas,
    tables: snapshot.tables,
    schemaReady: snapshot.schemaReady,
    error: snapshot.error,
  };
}
