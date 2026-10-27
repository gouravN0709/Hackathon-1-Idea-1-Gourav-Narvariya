import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");

const TABLES_REQUIRING_RLS = [
  "public.business_settings",
  "public.staff_profiles",
  "public.guests",
  "public.guest_contacts",
  "public.restaurant_tables",
  "public.weekly_hours",
  "public.service_shifts",
  "public.special_closures",
  "public.service_capacity",
  "public.reservations",
  "public.table_assignments",
  "public.restaurant_areas",
  "public.table_service_states",
];

function loadAllMigrationSql(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql") && !name.startsWith("."))
    .sort()
    .map((name) => readFileSync(join(MIGRATIONS_DIR, name), "utf8"))
    .join("\n");
}

describe("RLS migration contract", () => {
  const sql = loadAllMigrationSql();

  it("enables RLS on every application table", () => {
    for (const table of TABLES_REQUIRING_RLS) {
      expect(sql).toContain(`alter table ${table} enable row level security`);
    }
  });

  it("defines staff and guest policies (not empty RLS)", () => {
    const policyCount = (sql.match(/create policy/gi) ?? []).length;
    expect(policyCount).toBeGreaterThanOrEqual(30);
  });
});
