import { parseDateInput } from "@/lib/service-calendar";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseOptionalShiftId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "all") {
    return null;
  }
  return UUID_RE.test(trimmed) ? trimmed : null;
}

export function parseRequiredUuid(raw: string): string | null {
  const trimmed = raw.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}

export function validateClosureInput(input: {
  startsOn: string;
  endsOn: string;
  shiftId: string;
  reason: string;
}):
  | { ok: true; value: { startsOn: string; endsOn: string; shiftId: string | null; reason: string } }
  | { ok: false; message: string } {
  const starts = parseDateInput(input.startsOn.trim());
  const ends = parseDateInput(input.endsOn.trim());
  if (!starts || !ends) {
    return { ok: false, message: "Enter valid start and end dates." };
  }
  if (ends < starts) {
    return { ok: false, message: "End date must be on or after the start date." };
  }

  const reason = input.reason.trim();
  if (reason.length < 1 || reason.length > 200) {
    return { ok: false, message: "Enter a closure reason (1–200 characters)." };
  }

  const shiftRaw = input.shiftId.trim();
  let shiftId: string | null = null;
  if (shiftRaw && shiftRaw !== "all") {
    shiftId = parseOptionalShiftId(shiftRaw);
    if (!shiftId) {
      return { ok: false, message: "Choose a valid shift or whole-farm closure." };
    }
  }

  return {
    ok: true,
    value: {
      startsOn: input.startsOn.trim(),
      endsOn: input.endsOn.trim(),
      shiftId,
      reason,
    },
  };
}

export function validateShiftUpdateInput(input: {
  shiftId: string;
  maxCovers: string;
  isActive: string;
}): { ok: true; value: { shiftId: string; maxCovers: number; isActive: boolean } } | { ok: false; message: string } {
  const shiftId = parseRequiredUuid(input.shiftId);
  if (!shiftId) {
    return { ok: false, message: "Invalid shift." };
  }

  const maxCovers = Number(input.maxCovers);
  if (!Number.isInteger(maxCovers) || maxCovers < 1 || maxCovers > 500) {
    return { ok: false, message: "Max covers must be between 1 and 500." };
  }

  const isActive = input.isActive === "true" || input.isActive === "on";

  return { ok: true, value: { shiftId, maxCovers, isActive } };
}

export function validateTableCreateInput(input: {
  label: string;
  seatCount: string;
}): { ok: true; value: { label: string; seatCount: number } } | { ok: false; message: string } {
  const label = input.label.trim();
  if (label.length < 1 || label.length > 20) {
    return { ok: false, message: "Table label must be 1–20 characters." };
  }

  const seatCount = Number(input.seatCount);
  if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 24) {
    return { ok: false, message: "Seat count must be between 1 and 24." };
  }

  return { ok: true, value: { label, seatCount } };
}

export function validateTableToggleInput(input: {
  tableId: string;
  isActive: string;
}): { ok: true; value: { tableId: string; isActive: boolean } } | { ok: false; message: string } {
  const tableId = parseRequiredUuid(input.tableId);
  if (!tableId) {
    return { ok: false, message: "Invalid table." };
  }

  const isActive = input.isActive === "true" || input.isActive === "on";
  return { ok: true, value: { tableId, isActive } };
}
