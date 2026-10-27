import { describe, expect, it } from "vitest";
import {
  intendedPathFromUrl,
  readIntendedPathFromHeaders,
} from "@/lib/request-path";

describe("intendedPathFromUrl", () => {
  it("preserves admin floor-plan path and query", () => {
    expect(intendedPathFromUrl("/admin/floor-plan", "")).toBe("/admin/floor-plan");
    expect(intendedPathFromUrl("/admin/floor-plan", "?area=1")).toBe(
      "/admin/floor-plan?area=1",
    );
  });

  it("preserves staff floor path", () => {
    expect(intendedPathFromUrl("/staff/floor", "?date=2026-10-27")).toBe(
      "/staff/floor?date=2026-10-27",
    );
  });
});

describe("readIntendedPathFromHeaders", () => {
  it("uses header when valid", () => {
    expect(readIntendedPathFromHeaders("/admin/floor-plan", "/admin")).toBe(
      "/admin/floor-plan",
    );
  });

  it("falls back when header missing", () => {
    expect(readIntendedPathFromHeaders(null, "/admin")).toBe("/admin");
  });
});
