"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createFloorPlanTable,
  createRestaurantArea,
  deleteFloorPlanTable,
  deleteRestaurantArea,
  initialAdminFloorPlanMutationState,
  renameRestaurantArea,
  saveFloorTableLayout,
  updateAreaCanvasSize,
} from "@/app/admin/(panel)/floor-plan/actions";
import { FloorPlanCanvas } from "@/components/floor/floor-plan-canvas";
import type { FloorPlanTableRow, RestaurantAreaRow } from "@/lib/floor/types";
import { cn } from "@/lib/cn";

type AdminFloorPlanEditorProps = {
  areas: RestaurantAreaRow[];
  tables: FloorPlanTableRow[];
  schemaReady: boolean;
};

const fieldClass =
  "w-full min-h-10 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 font-body-md text-body-md text-on-surface";

function MutationBanner({
  state,
}: {
  state: typeof initialAdminFloorPlanMutationState;
}) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm text-on-error-container" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success && state.message) {
    return (
      <p className="rounded-lg bg-primary-container/30 p-space-sm font-body-sm text-body-sm text-primary" role="status">
        {state.message}
      </p>
    );
  }
  return null;
}

export function AdminFloorPlanEditor({
  areas,
  tables,
  schemaReady,
}: AdminFloorPlanEditorProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(
    areas[0]?.id ?? null,
  );
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    tables[0]?.id ?? null,
  );

  const [areaState, areaAction, areaPending] = useActionState(
    createRestaurantArea,
    initialAdminFloorPlanMutationState,
  );
  const [renameState, renameAction, renamePending] = useActionState(
    renameRestaurantArea,
    initialAdminFloorPlanMutationState,
  );
  const [deleteAreaState, deleteAreaAction] = useActionState(
    deleteRestaurantArea,
    initialAdminFloorPlanMutationState,
  );
  const [saveState, saveAction, savePending] = useActionState(
    saveFloorTableLayout,
    initialAdminFloorPlanMutationState,
  );
  const [createTableState, createTableAction, createTablePending] = useActionState(
    createFloorPlanTable,
    initialAdminFloorPlanMutationState,
  );
  const [deleteTableState, deleteTableAction] = useActionState(
    deleteFloorPlanTable,
    initialAdminFloorPlanMutationState,
  );
  const [canvasState, canvasAction, canvasPending] = useActionState(
    updateAreaCanvasSize,
    initialAdminFloorPlanMutationState,
  );

  const selectedArea =
    areas.find((area) => area.id === selectedAreaId) ?? areas[0] ?? null;
  const selectedTable =
    tables.find((table) => table.id === selectedTableId) ?? null;

  const areaTables = useMemo(() => {
    if (!selectedArea) {
      return tables.filter((table) => !table.area_id);
    }
    return tables.filter((table) => table.area_id === selectedArea.id);
  }, [tables, selectedArea]);

  const bannerState =
    [areaState, renameState, deleteAreaState, saveState, createTableState, deleteTableState, canvasState].find(
      (state) => state.error || (state.success && state.message),
    ) ?? initialAdminFloorPlanMutationState;

  if (!schemaReady) {
    return (
      <div className="rounded-xl border border-[#B77948]/40 bg-[#FFF8EF] p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-primary">Floor plan migration pending</h2>
        <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
          Apply{" "}
          <code className="text-sm">supabase/migrations/20261027153000_floor_plan_and_table_states.sql</code>{" "}
          after the base operations migration to enable areas and saved layouts. Table inventory from
          Operations still works without it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <MutationBanner state={bannerState} />

      <section className="grid gap-space-lg lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center gap-space-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              Area
              <select
                className={cn(fieldClass, "mt-1 max-w-xs")}
                value={selectedArea?.id ?? ""}
                onChange={(event) => setSelectedAreaId(event.target.value || null)}
              >
                {areas.length === 0 ? (
                  <option value="">Main floor (unassigned tables)</option>
                ) : (
                  areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <FloorPlanCanvas
            mode="edit"
            area={selectedArea}
            tables={tables}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            onTableMoved={(tableId, positionX, positionY) => {
              const table = tables.find((row) => row.id === tableId);
              if (!table) {
                return;
              }
              const form = document.getElementById(`floor-table-form-${tableId}`) as HTMLFormElement | null;
              if (!form) {
                return;
              }
              const px = form.querySelector<HTMLInputElement>('input[name="positionX"]');
              const py = form.querySelector<HTMLInputElement>('input[name="positionY"]');
              if (px) {
                px.value = String(positionX);
              }
              if (py) {
                py.value = String(positionY);
              }
              form.requestSubmit();
            }}
          />

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Drag tables to reposition. Changes save when you release. Edit details in the panel.
          </p>
        </div>

        <aside className="flex flex-col gap-space-lg rounded-xl border border-outline-variant/25 bg-white p-space-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">Areas</h2>
            <form action={areaAction} className="mt-space-sm flex flex-col gap-space-sm">
              <input name="name" placeholder="New area name" className={fieldClass} required />
              <input name="sortOrder" type="number" min={0} defaultValue={areas.length} className={fieldClass} />
              <button
                type="submit"
                disabled={areaPending}
                className="min-h-10 rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
              >
                Add area
              </button>
            </form>

            {selectedArea ? (
              <div className="mt-space-md flex flex-col gap-space-sm border-t border-outline-variant/20 pt-space-md">
                <form action={renameAction} className="flex flex-col gap-space-sm">
                  <input type="hidden" name="areaId" value={selectedArea.id} />
                  <input name="name" defaultValue={selectedArea.name} className={fieldClass} required />
                  <button type="submit" disabled={renamePending} className="min-h-10 rounded-lg border border-primary px-space-md text-primary">
                    Rename area
                  </button>
                </form>
                <form action={deleteAreaAction}>
                  <input type="hidden" name="areaId" value={selectedArea.id} />
                  <button type="submit" className="text-sm text-error underline-offset-2 hover:underline">
                    Delete area
                  </button>
                </form>
                <form action={canvasAction} className="flex flex-col gap-space-sm">
                  <input type="hidden" name="areaId" value={selectedArea.id} />
                  <input
                    name="canvasWidth"
                    type="number"
                    defaultValue={selectedArea.canvas_width}
                    className={fieldClass}
                    min={400}
                    max={4000}
                  />
                  <input
                    name="canvasHeight"
                    type="number"
                    defaultValue={selectedArea.canvas_height}
                    className={fieldClass}
                    min={300}
                    max={4000}
                  />
                  <button type="submit" disabled={canvasPending} className="min-h-10 rounded-lg border border-primary px-space-md text-primary">
                    Update canvas size
                  </button>
                </form>
              </div>
            ) : null}
          </div>

          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary">Tables in area</h2>
            <ul className="mt-space-sm flex flex-col gap-space-xs">
              {areaTables.map((table) => (
                <li key={table.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className={cn(
                      "w-full rounded-lg px-space-sm py-space-xs text-left font-body-md text-body-md",
                      selectedTableId === table.id ? "bg-primary-container/40 text-primary" : "hover:bg-surface-variant/30",
                    )}
                  >
                    {table.label} · {table.seat_count} seats
                  </button>
                </li>
              ))}
            </ul>

            <form action={createTableAction} className="mt-space-md flex flex-col gap-space-sm border-t border-outline-variant/20 pt-space-md">
              <input type="hidden" name="areaId" value={selectedArea?.id ?? ""} />
              <input name="label" placeholder="Table label" className={fieldClass} required />
              <input name="seatCount" type="number" min={1} max={24} defaultValue={4} className={fieldClass} />
              <input name="positionX" type="hidden" defaultValue={48} />
              <input name="positionY" type="hidden" defaultValue={48} />
              <button
                type="submit"
                disabled={createTablePending}
                className="min-h-10 rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
              >
                Add table here
              </button>
            </form>
          </div>

          {selectedTable ? (
            <div className="border-t border-outline-variant/20 pt-space-md">
              <h3 className="font-headline-sm text-headline-sm text-primary">Edit {selectedTable.label}</h3>
              <form
                id={`floor-table-form-${selectedTable.id}`}
                action={saveAction}
                className="mt-space-sm flex flex-col gap-space-sm"
              >
                <input type="hidden" name="tableId" value={selectedTable.id} />
                <input type="hidden" name="areaId" value={selectedArea?.id ?? ""} />
                <input name="label" defaultValue={selectedTable.label} className={fieldClass} required />
                <input name="seatCount" type="number" defaultValue={selectedTable.seat_count} className={fieldClass} />
                <input name="positionX" type="number" step="0.01" defaultValue={selectedTable.position_x} className={fieldClass} />
                <input name="positionY" type="number" step="0.01" defaultValue={selectedTable.position_y} className={fieldClass} />
                <input name="width" type="number" step="0.01" defaultValue={selectedTable.width} className={fieldClass} />
                <input name="height" type="number" step="0.01" defaultValue={selectedTable.height} className={fieldClass} />
                <input name="rotationDegrees" type="number" step="0.01" defaultValue={selectedTable.rotation_degrees} className={fieldClass} />
                <select name="shape" defaultValue={selectedTable.shape} className={fieldClass}>
                  <option value="rectangle">Rectangle</option>
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
                <input name="sortOrder" type="number" defaultValue={selectedTable.sort_order} className={fieldClass} />
                <select
                  name="isActive"
                  defaultValue={selectedTable.is_active ? "true" : "false"}
                  className={fieldClass}
                >
                  <option value="true">Active for service</option>
                  <option value="false">Unavailable (layout)</option>
                </select>
                <button
                  type="submit"
                  disabled={savePending}
                  className="min-h-10 rounded-lg bg-primary px-space-md font-body-md text-body-md font-semibold text-on-primary"
                >
                  Save table
                </button>
              </form>
              <form action={deleteTableAction} className="mt-space-sm">
                <input type="hidden" name="tableId" value={selectedTable.id} />
                <button type="submit" className="text-sm text-error underline-offset-2 hover:underline">
                  Remove table
                </button>
              </form>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
