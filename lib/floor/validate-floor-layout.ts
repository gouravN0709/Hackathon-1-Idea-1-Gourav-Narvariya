import { tableShapes } from "@/lib/floor/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseFloorUuid(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return UUID_PATTERN.test(trimmed) ? trimmed : null;
}

export function validateAreaName(name: string): { ok: true; value: string } | { ok: false; message: string } {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 40) {
    return { ok: false, message: "Area name must be 1–40 characters." };
  }
  return { ok: true, value: trimmed };
}

export function parseNumericField(
  raw: string,
  label: string,
  min: number,
  max: number,
): { ok: true; value: number } | { ok: false; message: string } {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    return { ok: false, message: `${label} must be between ${min} and ${max}.` };
  }
  return { ok: true, value };
}

export function validateTableLayoutPatch(input: {
  label: string;
  seatCount: string;
  positionX: string;
  positionY: string;
  width: string;
  height: string;
  rotationDegrees: string;
  shape: string;
  sortOrder: string;
}):
  | {
      ok: true;
      value: {
        label: string;
        seatCount: number;
        positionX: number;
        positionY: number;
        width: number;
        height: number;
        rotationDegrees: number;
        shape: (typeof tableShapes)[number];
        sortOrder: number;
      };
    }
  | { ok: false; message: string } {
  const label = input.label.trim();
  if (label.length < 1 || label.length > 20) {
    return { ok: false, message: "Table label must be 1–20 characters." };
  }

  const seatCount = Number(input.seatCount);
  if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 24) {
    return { ok: false, message: "Seat count must be between 1 and 24." };
  }

  const positionX = Number(input.positionX);
  const positionY = Number(input.positionY);
  if (
    !Number.isFinite(positionX) ||
    !Number.isFinite(positionY) ||
    positionX < -100000 ||
    positionX > 100000 ||
    positionY < -100000 ||
    positionY > 100000
  ) {
    return { ok: false, message: "Position is out of allowed range." };
  }

  const width = Number(input.width);
  const height = Number(input.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { ok: false, message: "Table width and height must be positive." };
  }

  const rotationDegrees = Number(input.rotationDegrees);
  if (
    !Number.isFinite(rotationDegrees) ||
    rotationDegrees < 0 ||
    rotationDegrees >= 360
  ) {
    return { ok: false, message: "Rotation must be between 0 and 359.99." };
  }

  const shape = input.shape.trim();
  if (!(tableShapes as readonly string[]).includes(shape)) {
    return { ok: false, message: "Invalid table shape." };
  }

  const sortOrderRaw = Number(input.sortOrder || "0");
  const sortOrder =
    Number.isInteger(sortOrderRaw) && sortOrderRaw >= 0 ? sortOrderRaw : 0;

  return {
    ok: true,
    value: {
      label,
      seatCount,
      positionX,
      positionY,
      width,
      height,
      rotationDegrees,
      shape: shape as (typeof tableShapes)[number],
      sortOrder,
    },
  };
}
