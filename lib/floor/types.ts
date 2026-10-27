export const tableOperationalStatuses = [
  "available",
  "reserved",
  "arrived",
  "occupied",
  "cleaning",
  "blocked",
] as const;

export type TableOperationalStatus = (typeof tableOperationalStatuses)[number];

export const tableShapes = ["rectangle", "circle", "square"] as const;
export type TableShape = (typeof tableShapes)[number];

export type RestaurantAreaRow = {
  id: string;
  name: string;
  sort_order: number;
  canvas_width: number;
  canvas_height: number;
};

export type FloorPlanTableRow = {
  id: string;
  label: string;
  seat_count: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation_degrees: number;
  shape: TableShape;
  is_active: boolean;
  sort_order: number;
  area_id: string | null;
};

export type TableServiceStateRow = {
  table_id: string;
  operational_status: TableOperationalStatus;
  updated_at: string;
};

export type FloorReservationRow = {
  id: string;
  reference: string;
  guestDisplayName: string;
  serviceDate: string;
  arrivalTime: string;
  partySize: number;
  status: string;
  shiftId: string;
  shiftName: string | null;
  tableIds: string[];
  tableLabels: string[];
  updatedAt: string;
};

export type FloorServiceSnapshot = {
  areas: RestaurantAreaRow[];
  tables: FloorPlanTableRow[];
  states: TableServiceStateRow[];
  reservations: FloorReservationRow[];
  shifts: Array<{
    id: string;
    name: string;
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  }>;
  schemaReady: boolean;
  error: string | null;
};
