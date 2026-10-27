import { describe, expect, it } from "vitest";
import {
  parseFloorUuid,
  validateAreaName,
  validateTableLayoutPatch,
} from "@/lib/floor/validate-floor-layout";

const VALID_UUID = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

describe("parseFloorUuid", () => {
  it("accepts valid UUIDs", () => {
    expect(parseFloorUuid(VALID_UUID)).toBe(VALID_UUID);
    expect(parseFloorUuid(`  ${VALID_UUID}  `)).toBe(VALID_UUID);
  });

  it("rejects invalid values", () => {
    expect(parseFloorUuid("not-a-uuid")).toBeNull();
    expect(parseFloorUuid("")).toBeNull();
    expect(parseFloorUuid(42)).toBeNull();
  });
});

describe("validateAreaName", () => {
  it("trims and accepts 1–40 characters", () => {
    expect(validateAreaName("  Main room  ")).toEqual({ ok: true, value: "Main room" });
  });

  it("rejects empty or overlong names", () => {
    expect(validateAreaName("   ").ok).toBe(false);
    expect(validateAreaName("x".repeat(41)).ok).toBe(false);
  });
});

describe("validateTableLayoutPatch", () => {
  const base = {
    label: "T1",
    seatCount: "4",
    positionX: "100",
    positionY: "200",
    width: "80",
    height: "80",
    rotationDegrees: "0",
    shape: "rectangle",
    sortOrder: "0",
  };

  it("accepts a valid layout patch", () => {
    const result = validateTableLayoutPatch(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seatCount).toBe(4);
      expect(result.value.shape).toBe("rectangle");
    }
  });

  it("rejects invalid seat count and shape", () => {
    expect(validateTableLayoutPatch({ ...base, seatCount: "0" }).ok).toBe(false);
    expect(validateTableLayoutPatch({ ...base, shape: "hexagon" }).ok).toBe(false);
  });

  it("rejects non-positive dimensions", () => {
    expect(validateTableLayoutPatch({ ...base, width: "0" }).ok).toBe(false);
  });
});
