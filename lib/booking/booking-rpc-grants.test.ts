import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const OPERATIONS_MIGRATION = join(
  process.cwd(),
  "supabase/migrations/20261026184605_restaurant_operations.sql",
);

function loadOperationsMigration(): string {
  return readFileSync(OPERATIONS_MIGRATION, "utf8");
}

describe("booking RPC EXECUTE grants (migration contract)", () => {
  it("revokes public booking RPCs from anon and authenticated", () => {
    const sql = loadOperationsMigration();
    expect(sql).toContain(
      "revoke all on function public.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) from public, anon, authenticated, service_role",
    );
    expect(sql).toContain(
      "revoke all on function public.assign_reservation_tables(uuid, uuid[]) from public, anon, authenticated, service_role",
    );
    expect(sql).toContain(
      "revoke all on function private.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) from public, anon, authenticated, service_role",
    );
  });

  it("grants EXECUTE on booking RPCs only to service_role", () => {
    const sql = loadOperationsMigration();
    expect(sql).toContain(
      "grant execute on function public.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) to service_role",
    );
    expect(sql).toContain(
      "grant execute on function public.assign_reservation_tables(uuid, uuid[]) to service_role",
    );
    expect(sql).not.toMatch(
      /grant execute on function public\.create_reservation\([^)]+\) to anon/,
    );
    expect(sql).not.toMatch(
      /grant execute on function public\.create_reservation\([^)]+\) to authenticated/,
    );
  });

  it("documents service-role-only guard inside public.create_reservation", () => {
    const sql = loadOperationsMigration();
    expect(sql).toContain("if current_user is distinct from 'service_role' then");
    expect(sql).toContain("reservation changes are server-only");
  });
});

const liveUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const liveAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const runLiveSupabase =
  process.env.RUN_LIVE_SUPABASE_TESTS === "true" && Boolean(liveUrl && liveAnonKey);

describe.runIf(runLiveSupabase)("live Supabase: anon cannot call create_reservation RPC", () => {
  it("returns a permission or not-exposed error", async () => {
    const client = createClient(liveUrl!, liveAnonKey!);
    const { data, error } = await client.rpc("create_reservation", {
      p_service_date: "2099-01-01",
      p_shift_id: "00000000-0000-0000-0000-000000000001",
      p_arrival_time: "13:30:00",
      p_adult_count: 2,
      p_child_count: 0,
      p_table_ids: [],
      p_guest_name: "Grant Test",
      p_guest_email: "grant-test@example.com",
      p_guest_phone: "+34000000000",
      p_notes: null,
    });

    expect(data).toBeNull();
    expect(error).toBeTruthy();
    const message = `${error?.message ?? ""} ${error?.details ?? ""}`.toLowerCase();
    const code = error?.code ?? "";
    const denied =
      code === "42501" ||
      code === "PGRST301" ||
      code === "PGRST202" ||
      message.includes("permission") ||
      message.includes("not found") ||
      message.includes("server-only");
    expect(denied).toBe(true);
  });
});
