import type { TableOperationalStatus } from "@/lib/floor/types";

export type ResolvedTableStatus = {
  status: TableOperationalStatus;
  source: "state" | "assignment" | "inactive";
};

export function resolveTableOperationalStatus(input: {
  isActive: boolean;
  hasActiveAssignment: boolean;
  storedStatus: TableOperationalStatus | null;
}): ResolvedTableStatus {
  if (!input.isActive) {
    return { status: "blocked", source: "inactive" };
  }

  if (input.storedStatus === "blocked") {
    return { status: "blocked", source: "state" };
  }

  if (input.storedStatus) {
    return { status: input.storedStatus, source: "state" };
  }

  if (input.hasActiveAssignment) {
    return { status: "reserved", source: "assignment" };
  }

  return { status: "available", source: "state" };
}

export const TABLE_STATUS_LABELS: Record<TableOperationalStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  arrived: "Arrived",
  occupied: "Occupied",
  cleaning: "Cleaning",
  blocked: "Unavailable",
};

export const TABLE_STATUS_COLORS: Record<TableOperationalStatus, string> = {
  available: "bg-[#5A7A5E] border-[#3D5A40]",
  reserved: "bg-[#B77948] border-[#8F5E35]",
  arrived: "bg-[#C4A035] border-[#9A7F28]",
  occupied: "bg-[#8B3A3A] border-[#6B2A2A]",
  cleaning: "bg-[#6B7C8F] border-[#4F5E6D]",
  blocked: "bg-[#424842] border-[#292B25]",
};

export function isTableOperationalStatus(value: string): value is TableOperationalStatus {
  return (
    value === "available" ||
    value === "reserved" ||
    value === "arrived" ||
    value === "occupied" ||
    value === "cleaning" ||
    value === "blocked"
  );
}

const FLOOR_TABLE_TRANSITIONS: Record<
  TableOperationalStatus,
  TableOperationalStatus[]
> = {
  available: ["blocked", "reserved"],
  reserved: ["available", "arrived", "occupied", "blocked"],
  arrived: ["reserved", "occupied", "available"],
  occupied: ["cleaning"],
  cleaning: ["available", "blocked"],
  blocked: ["available"],
};

export function canTransitionTableStatus(
  from: TableOperationalStatus,
  to: TableOperationalStatus,
): boolean {
  if (from === to) {
    return true;
  }
  return FLOOR_TABLE_TRANSITIONS[from]?.includes(to) ?? false;
}
