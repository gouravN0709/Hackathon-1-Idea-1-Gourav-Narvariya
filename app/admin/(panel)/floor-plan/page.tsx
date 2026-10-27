import { connection } from "next/server";
import { AdminFloorPlanEditor } from "@/components/admin/admin-floor-plan-editor";
import { ADMIN_FLOOR_PLAN_PATH } from "@/lib/admin/admin-routes";
import { loadFloorPlanEditorSnapshot } from "@/lib/floor/load-floor-snapshot";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata = {
  title: "Floor plan · Admin",
};

export default async function AdminFloorPlanPage() {
  await connection();
  const supabase = await createClient();
  const snapshot = await loadFloorPlanEditorSnapshot(supabase);

  return (
    <div className="flex flex-col gap-space-xl p-space-md lg:p-space-xl">
      <header>
        <h1 className="font-headline-md text-headline-md text-[#294632]">Floor plan</h1>
        <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-[#424842]">
          Arrange dining areas and tables. Layout saves to the database and appears on the staff
          floor screen during service.
        </p>
      </header>

      {snapshot.error ? (
        <p className="rounded-lg bg-error-container p-space-md font-body-md text-body-md text-on-error-container" role="alert">
          Could not load floor plan data. Confirm database access for {ADMIN_FLOOR_PLAN_PATH}.
        </p>
      ) : null}

      <AdminFloorPlanEditor
        areas={snapshot.areas}
        tables={snapshot.tables}
        schemaReady={snapshot.schemaReady}
      />
    </div>
  );
}
