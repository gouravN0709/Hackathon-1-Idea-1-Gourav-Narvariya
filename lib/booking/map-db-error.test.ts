import { describe, expect, it } from "vitest";
import { mapPostgresMessage, mapSupabaseError } from "@/lib/booking/map-db-error";

describe("mapPostgresMessage", () => {
  it("maps full service errors", () => {
    expect(mapPostgresMessage("service is full").code).toBe("full");
  });

  it("maps unavailable slots", () => {
    expect(mapPostgresMessage("service is not bookable").code).toBe("unavailable");
  });

  it("maps table conflicts", () => {
    expect(mapPostgresMessage("table is already assigned").code).toBe("tables");
  });

  it("maps capacity migration type errors to configuration", () => {
    expect(
      mapPostgresMessage("COALESCE types bigint and integer cannot be matched").code,
    ).toBe("configuration");
  });
});

describe("mapSupabaseError", () => {
  it("maps missing RPC to configuration", () => {
    expect(
      mapSupabaseError({ code: "PGRST202", message: "Could not find the function" }).code,
    ).toBe("configuration");
  });
});
