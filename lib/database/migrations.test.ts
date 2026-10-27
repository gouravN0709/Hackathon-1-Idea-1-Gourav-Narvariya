import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");

function listMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql") && !name.startsWith("."))
    .sort();
}

describe("supabase migrations", () => {
  it("lists versioned SQL files in chronological order", () => {
    const files = listMigrationFiles();
    expect(files.length).toBeGreaterThanOrEqual(3);
    expect(files[0]).toMatch(/^20261026184605_/);
    expect(files.at(-1)).toMatch(/^20261027170000_fix_capacity_coalesce\.sql$/);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  it("includes floor plan and capacity fix migrations", () => {
    const files = listMigrationFiles();
    expect(files.some((f) => f.includes("floor_plan_and_table_states"))).toBe(true);
    expect(files.some((f) => f.includes("fix_capacity_coalesce"))).toBe(true);
  });
});
