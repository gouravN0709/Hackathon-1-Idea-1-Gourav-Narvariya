"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  resolveTableOperationalStatus,
  TABLE_STATUS_COLORS,
  TABLE_STATUS_LABELS,
} from "@/lib/floor/table-status";
import type {
  FloorPlanTableRow,
  RestaurantAreaRow,
  TableOperationalStatus,
  TableServiceStateRow,
} from "@/lib/floor/types";
import { cn } from "@/lib/cn";

export type FloorPlanCanvasMode = "view" | "edit";

type FloorPlanCanvasProps = {
  mode: FloorPlanCanvasMode;
  area: RestaurantAreaRow | null;
  tables: FloorPlanTableRow[];
  states?: TableServiceStateRow[];
  assignedTableIds?: Set<string>;
  selectedTableId?: string | null;
  onSelectTable?: (tableId: string) => void;
  onTableMoved?: (tableId: string, positionX: number, positionY: number) => void;
};

function tablesForArea(tables: FloorPlanTableRow[], areaId: string | null) {
  if (!areaId) {
    return tables.filter((table) => !table.area_id);
  }
  return tables.filter((table) => table.area_id === areaId);
}

export function FloorPlanCanvas({
  mode,
  area,
  tables,
  states = [],
  assignedTableIds = new Set(),
  selectedTableId,
  onSelectTable,
  onTableMoved,
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const stateByTable = useMemo(() => {
    const map = new Map<string, TableOperationalStatus>();
    for (const state of states) {
      map.set(state.table_id, state.operational_status);
    }
    return map;
  }, [states]);

  const visibleTables = useMemo(
    () => tablesForArea(tables, area?.id ?? null),
    [tables, area?.id],
  );

  const canvasWidth = area?.canvas_width ?? 1200;
  const canvasHeight = area?.canvas_height ?? 800;

  const finishDrag = useCallback(
    (tableId: string, clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !onTableMoved) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = canvasHeight / rect.height;
      const x = (clientX - rect.left) * scaleX - dragOffset.current.x;
      const y = (clientY - rect.top) * scaleY - dragOffset.current.y;
      const clampedX = Math.max(0, Math.min(canvasWidth - 40, x));
      const clampedY = Math.max(0, Math.min(canvasHeight - 40, y));
      onTableMoved(tableId, Math.round(clampedX * 100) / 100, Math.round(clampedY * 100) / 100);
    },
    [canvasWidth, canvasHeight, onTableMoved],
  );

  return (
    <div className="overflow-auto rounded-xl border border-outline-variant/30 bg-[#E8E2D4] p-space-sm">
      <div
        ref={canvasRef}
        className="relative mx-auto min-h-[280px] w-full max-w-full origin-top-left bg-[#F7F3EB]"
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          maxHeight: mode === "edit" ? "70vh" : "55vh",
        }}
        onPointerUp={(event) => {
          if (draggingId) {
            finishDrag(draggingId, event.clientX, event.clientY);
            setDraggingId(null);
          }
        }}
        onPointerLeave={(event) => {
          if (draggingId) {
            finishDrag(draggingId, event.clientX, event.clientY);
            setDraggingId(null);
          }
        }}
      >
        {visibleTables.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-space-md text-center font-body-md text-body-md text-on-surface-variant">
            No tables in this area yet.
          </p>
        ) : null}

        {visibleTables.map((table) => {
          const stored = stateByTable.get(table.id) ?? null;
          const resolved = resolveTableOperationalStatus({
            isActive: table.is_active,
            hasActiveAssignment: assignedTableIds.has(table.id),
            storedStatus: stored,
          });
          const leftPct = (table.position_x / canvasWidth) * 100;
          const topPct = (table.position_y / canvasHeight) * 100;
          const widthPct = (table.width / canvasWidth) * 100;
          const heightPct = (table.height / canvasHeight) * 100;
          const selected = selectedTableId === table.id;

          return (
            <button
              key={table.id}
              type="button"
              aria-label={`${table.label}, ${TABLE_STATUS_LABELS[resolved.status]}`}
              className={cn(
                "absolute flex flex-col items-center justify-center border-2 text-center font-label-sm text-label-sm font-semibold text-white shadow-sm transition-transform",
                TABLE_STATUS_COLORS[resolved.status],
                table.shape === "circle" ? "rounded-full" : "rounded-lg",
                selected ? "ring-2 ring-[#294632] ring-offset-2" : "",
                mode === "edit" ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
              )}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                minWidth: "2.75rem",
                minHeight: "2.75rem",
                transform: `rotate(${table.rotation_degrees}deg)`,
              }}
              onClick={() => onSelectTable?.(table.id)}
              onPointerDown={(event) => {
                if (mode !== "edit") {
                  return;
                }
                event.preventDefault();
                const canvas = canvasRef.current;
                if (!canvas) {
                  return;
                }
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvasWidth / rect.width;
                const scaleY = canvasHeight / rect.height;
                dragOffset.current = {
                  x: (event.clientX - rect.left) * scaleX - table.position_x,
                  y: (event.clientY - rect.top) * scaleY - table.position_y,
                };
                setDraggingId(table.id);
                onSelectTable?.(table.id);
              }}
            >
              <span className="leading-tight">{table.label}</span>
              <span className="text-[0.65rem] font-normal opacity-90">
                {table.seat_count} · {TABLE_STATUS_LABELS[resolved.status]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
