export type TableCandidate = {
  id: string;
  seat_count: number;
};

/**
 * Pick the smallest set of tables whose seats cover the party.
 * Prefers a single table when one fits.
 */
export function selectTablesForParty(
  tables: TableCandidate[],
  partySize: number,
): string[] | null {
  if (partySize < 1 || tables.length === 0) {
    return null;
  }

  const sortedAsc = [...tables].sort((a, b) => a.seat_count - b.seat_count);
  const single = sortedAsc.find((table) => table.seat_count >= partySize);
  if (single) {
    return [single.id];
  }

  const sortedDesc = [...tables].sort((a, b) => b.seat_count - a.seat_count);
  let remaining = partySize;
  const selected: string[] = [];

  for (const table of sortedDesc) {
    if (remaining <= 0) {
      break;
    }
    selected.push(table.id);
    remaining -= table.seat_count;
  }

  if (remaining > 0) {
    return null;
  }

  return selected;
}
