"use server";

import { revalidatePath } from "next/cache";
import { ADMIN_FLOOR_PLAN_PATH, revalidateAdminPanelPaths } from "@/lib/admin/admin-routes";
import { requireAdminMutationAccess } from "@/lib/admin/require-admin-access";
import {
  parseFloorUuid,
  parseNumericField,
  validateAreaName,
  validateTableLayoutPatch,
} from "@/lib/floor/validate-floor-layout";
import { STAFF_FLOOR_PATH } from "@/lib/staff/staff-routes";
import { createClient } from "@/lib/supabase/server";

export type AdminFloorPlanMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
};

export const initialAdminFloorPlanMutationState: AdminFloorPlanMutationState = {
  success: false,
  error: null,
  message: null,
};

function revalidateFloorViews() {
  revalidatePath(ADMIN_FLOOR_PLAN_PATH);
  revalidatePath(STAFF_FLOOR_PATH);
  for (const path of revalidateAdminPanelPaths()) {
    revalidatePath(path);
  }
}

export async function createRestaurantArea(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const parsedName = validateAreaName(String(formData.get("name") ?? ""));
  if (!parsedName.ok) {
    return { success: false, error: parsedName.message, message: null };
  }

  const sortOrderRaw = Number(String(formData.get("sortOrder") ?? "0"));
  const sortOrder =
    Number.isInteger(sortOrderRaw) && sortOrderRaw >= 0 ? sortOrderRaw : 0;

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_areas").insert({
    name: parsedName.value,
    sort_order: sortOrder,
  });

  if (error) {
    return {
      success: false,
      error: "Could not create the area. Names must be unique.",
      message: null,
    };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Area created." };
}

export async function renameRestaurantArea(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const areaId = parseFloorUuid(formData.get("areaId"));
  if (!areaId) {
    return { success: false, error: "Invalid area.", message: null };
  }

  const parsedName = validateAreaName(String(formData.get("name") ?? ""));
  if (!parsedName.ok) {
    return { success: false, error: parsedName.message, message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_areas")
    .update({ name: parsedName.value })
    .eq("id", areaId);

  if (error) {
    return { success: false, error: "Could not rename the area.", message: null };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Area renamed." };
}

export async function deleteRestaurantArea(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const areaId = parseFloorUuid(formData.get("areaId"));
  if (!areaId) {
    return { success: false, error: "Invalid area.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_areas").delete().eq("id", areaId);

  if (error) {
    return {
      success: false,
      error: "Could not delete the area. Move or remove its tables first.",
      message: null,
    };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Area removed." };
}

export async function saveFloorTableLayout(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const tableId = parseFloorUuid(formData.get("tableId"));
  if (!tableId) {
    return { success: false, error: "Invalid table.", message: null };
  }

  const parsed = validateTableLayoutPatch({
    label: String(formData.get("label") ?? ""),
    seatCount: String(formData.get("seatCount") ?? ""),
    positionX: String(formData.get("positionX") ?? ""),
    positionY: String(formData.get("positionY") ?? ""),
    width: String(formData.get("width") ?? ""),
    height: String(formData.get("height") ?? ""),
    rotationDegrees: String(formData.get("rotationDegrees") ?? ""),
    shape: String(formData.get("shape") ?? "rectangle"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const areaIdRaw = String(formData.get("areaId") ?? "").trim();
  const areaId = areaIdRaw ? parseFloorUuid(areaIdRaw) : null;
  if (areaIdRaw && !areaId) {
    return { success: false, error: "Invalid area for this table.", message: null };
  }

  const isActive = String(formData.get("isActive") ?? "true") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_tables")
    .update({
      label: parsed.value.label,
      seat_count: parsed.value.seatCount,
      position_x: parsed.value.positionX,
      position_y: parsed.value.positionY,
      width: parsed.value.width,
      height: parsed.value.height,
      rotation_degrees: parsed.value.rotationDegrees,
      shape: parsed.value.shape,
      sort_order: parsed.value.sortOrder,
      area_id: areaId,
      is_active: isActive,
    })
    .eq("id", tableId);

  if (error) {
    return {
      success: false,
      error: "Could not save the table layout. Check labels and active assignments.",
      message: null,
    };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Table saved." };
}

export async function createFloorPlanTable(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const parsed = validateTableLayoutPatch({
    label: String(formData.get("label") ?? ""),
    seatCount: String(formData.get("seatCount") ?? "4"),
    positionX: String(formData.get("positionX") ?? "40"),
    positionY: String(formData.get("positionY") ?? "40"),
    width: String(formData.get("width") ?? "80"),
    height: String(formData.get("height") ?? "80"),
    rotationDegrees: String(formData.get("rotationDegrees") ?? "0"),
    shape: String(formData.get("shape") ?? "rectangle"),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const areaIdRaw = String(formData.get("areaId") ?? "").trim();
  const areaId = areaIdRaw ? parseFloorUuid(areaIdRaw) : null;

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").insert({
    label: parsed.value.label,
    seat_count: parsed.value.seatCount,
    position_x: parsed.value.positionX,
    position_y: parsed.value.positionY,
    width: parsed.value.width,
    height: parsed.value.height,
    rotation_degrees: parsed.value.rotationDegrees,
    shape: parsed.value.shape,
    sort_order: parsed.value.sortOrder,
    area_id: areaId,
    is_active: true,
  });

  if (error) {
    return {
      success: false,
      error: "Could not add the table. Labels must be unique.",
      message: null,
    };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Table added to the floor plan." };
}

export async function deleteFloorPlanTable(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const tableId = parseFloorUuid(formData.get("tableId"));
  if (!tableId) {
    return { success: false, error: "Invalid table.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").delete().eq("id", tableId);

  if (error) {
    return {
      success: false,
      error: "Could not remove the table. Active assignments may block deletion.",
      message: null,
    };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Table removed." };
}

export async function updateAreaCanvasSize(
  _prev: AdminFloorPlanMutationState,
  formData: FormData,
): Promise<AdminFloorPlanMutationState> {
  const access = await requireAdminMutationAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const areaId = parseFloorUuid(formData.get("areaId"));
  if (!areaId) {
    return { success: false, error: "Invalid area.", message: null };
  }

  const width = parseNumericField(String(formData.get("canvasWidth") ?? ""), "Canvas width", 400, 4000);
  const height = parseNumericField(String(formData.get("canvasHeight") ?? ""), "Canvas height", 300, 4000);
  if (!width.ok) {
    return { success: false, error: width.message, message: null };
  }
  if (!height.ok) {
    return { success: false, error: height.message, message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_areas")
    .update({
      canvas_width: width.value,
      canvas_height: height.value,
    })
    .eq("id", areaId);

  if (error) {
    return { success: false, error: "Could not update canvas size.", message: null };
  }

  revalidateFloorViews();
  return { success: true, error: null, message: "Canvas size updated." };
}
