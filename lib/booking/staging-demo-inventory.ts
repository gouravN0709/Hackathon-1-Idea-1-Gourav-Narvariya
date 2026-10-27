import type { RestaurantTableRow } from "@/lib/staff/load-operations-snapshot";

/** Legacy labels from `restaurant_tables.demo.sql` before staging relabel. */
export function isLegacyDemoTableLabel(label: string): boolean {
  return label.trim().toLowerCase().startsWith("demo ");
}

/**
 * True when the eight sort_order 1–8 tables match the approved staging demo
 * layout (Table 1–8, four 2-seat and four 6-seat, 32 seats total).
 */
export function isStagingDemoInventory(tables: RestaurantTableRow[]): boolean {
  const active = tables.filter(
    (row) => row.is_active && row.sort_order >= 1 && row.sort_order <= 8,
  );
  if (active.length !== 8) {
    return false;
  }

  for (const row of active) {
    const expectedLabel = `Table ${row.sort_order}`;
    const expectedSeats = row.sort_order <= 4 ? 2 : 6;
    if (row.label.trim() !== expectedLabel || row.seat_count !== expectedSeats) {
      return false;
    }
  }

  return active.reduce((sum, row) => sum + row.seat_count, 0) === 32;
}
