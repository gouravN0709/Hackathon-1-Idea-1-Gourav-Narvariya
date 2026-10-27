"use server";

import { revalidatePath } from "next/cache";
import { requireStaffManagerAccess } from "@/lib/staff/require-staff-manager-access";
import { requireStaffOwnerAccess } from "@/lib/staff/require-staff-owner-access";
import { validateBusinessTimezoneInput } from "@/lib/staff/validate-business-settings";
import { STAFF_OPERATIONS_PATH } from "@/lib/staff/staff-routes";
import {
  validateClosureInput,
  validateShiftUpdateInput,
  validateTableCreateInput,
  validateTableToggleInput,
  parseRequiredUuid,
} from "@/lib/staff/validate-operations-mutation";
import { validateShiftUpdateAgainstSeating } from "@/lib/booking/operations-readiness-checklist";
import { loadOperationsSnapshot } from "@/lib/staff/load-operations-snapshot";
import {
  mapWeeklyHoursDbErrorMessage,
  validateWeeklyHoursDelete,
  validateWeeklyHoursMutation,
  weeklyHoursDraftFromInput,
} from "@/lib/staff/weekly-hours-validation";
import { createClient } from "@/lib/supabase/server";

export type StaffOperationsMutationState = {
  success: boolean;
  error: string | null;
  message: string | null;
  /** Repopulates create forms after validation or save errors. */
  fields?: Record<string, string>;
};

export const initialStaffOperationsMutationState: StaffOperationsMutationState = {
  success: false,
  error: null,
  message: null,
};

function revalidateOperations() {
  revalidatePath(STAFF_OPERATIONS_PATH);
}

function closureFieldsFromForm(formData: FormData): Record<string, string> {
  return {
    startsOn: String(formData.get("startsOn") ?? ""),
    endsOn: String(formData.get("endsOn") ?? ""),
    shiftId: String(formData.get("shiftId") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  };
}

function tableCreateFieldsFromForm(formData: FormData): Record<string, string> {
  return {
    label: String(formData.get("label") ?? ""),
    seatCount: String(formData.get("seatCount") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? ""),
  };
}

export async function createSpecialClosure(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const fields = closureFieldsFromForm(formData);
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null, fields };
  }

  const parsed = validateClosureInput({
    startsOn: fields.startsOn,
    endsOn: fields.endsOn,
    shiftId: fields.shiftId,
    reason: fields.reason,
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null, fields };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("special_closures").insert({
    starts_on: parsed.value.startsOn,
    ends_on: parsed.value.endsOn,
    shift_id: parsed.value.shiftId,
    reason: parsed.value.reason,
  });

  if (error) {
    return {
      success: false,
      error: "Could not save the closure. Check dates and try again.",
      message: null,
      fields,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Closure added." };
}

export async function deleteSpecialClosure(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const closureId = parseRequiredUuid(String(formData.get("closureId") ?? ""));
  if (!closureId) {
    return { success: false, error: "Invalid closure.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("special_closures").delete().eq("id", closureId);

  if (error) {
    return {
      success: false,
      error: "Could not remove the closure. It may be protected by existing bookings.",
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Closure removed." };
}

export async function updateServiceShift(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const parsed = validateShiftUpdateInput({
    shiftId: String(formData.get("shiftId") ?? ""),
    maxCovers: String(formData.get("maxCovers") ?? ""),
    isActive: String(formData.get("isActive") ?? ""),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const supabase = await createClient();
  const snapshot = await loadOperationsSnapshot(supabase);
  if (snapshot.error) {
    return {
      success: false,
      error: "Could not load shifts and tables for validation.",
      message: null,
    };
  }

  const capacityGuard = validateShiftUpdateAgainstSeating(
    snapshot.shifts,
    snapshot.tables,
    {
      shiftId: parsed.value.shiftId,
      maxCovers: parsed.value.maxCovers,
      isActive: parsed.value.isActive,
    },
  );

  if (!capacityGuard.ok) {
    return { success: false, error: capacityGuard.message, message: null };
  }

  const { error } = await supabase
    .from("service_shifts")
    .update({
      max_covers: parsed.value.maxCovers,
      is_active: parsed.value.isActive,
    })
    .eq("id", parsed.value.shiftId);

  if (error) {
    return {
      success: false,
      error: "Could not update the shift. Check cover limits and overlap rules.",
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Shift updated." };
}

export async function createRestaurantTable(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const fields = tableCreateFieldsFromForm(formData);
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null, fields };
  }

  const parsed = validateTableCreateInput({
    label: fields.label,
    seatCount: fields.seatCount,
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null, fields };
  }

  const sortOrderRaw = Number(fields.sortOrder || "0");
  const sortOrder = Number.isInteger(sortOrderRaw) && sortOrderRaw >= 0 ? sortOrderRaw : 0;

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_tables").insert({
    label: parsed.value.label,
    seat_count: parsed.value.seatCount,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    return {
      success: false,
      error: "Could not add the table. Labels must be unique.",
      message: null,
      fields,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Table added." };
}

export async function updateBusinessSettingsTimezone(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const timezone = String(formData.get("timezone") ?? "");
  const fields = { timezone };
  const access = await requireStaffOwnerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null, fields };
  }

  const parsed = validateBusinessTimezoneInput({ timezone });
  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null, fields };
  }

  const supabase = await createClient();
  const { data: row, error: loadError } = await supabase
    .from("business_settings")
    .select("id")
    .maybeSingle();

  if (loadError || !row?.id) {
    return {
      success: false,
      error: "Could not load business settings. Confirm the database seed.",
      message: null,
      fields,
    };
  }

  const { error } = await supabase
    .from("business_settings")
    .update({
      timezone: parsed.value.timezone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (error) {
    return {
      success: false,
      error: "Could not save timezone. Use a recognized IANA name.",
      message: null,
      fields,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Business timezone updated." };
}

export async function createWeeklyHours(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const parsed = weeklyHoursDraftFromInput({
    dayOfWeek: String(formData.get("dayOfWeek") ?? ""),
    opensAt: String(formData.get("opensAt") ?? ""),
    closesAt: String(formData.get("closesAt") ?? ""),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const supabase = await createClient();
  const snapshot = await loadOperationsSnapshot(supabase);
  if (snapshot.error) {
    return {
      success: false,
      error: "Could not load weekly hours for validation.",
      message: null,
    };
  }

  const guard = validateWeeklyHoursMutation(snapshot.weeklyHours, snapshot.shifts, parsed.value);
  if (!guard.ok) {
    return { success: false, error: guard.message, message: null };
  }

  const { error } = await supabase.from("weekly_hours").insert({
    day_of_week: parsed.value.day_of_week,
    opens_at: parsed.value.opens_at,
    closes_at: parsed.value.closes_at,
  });

  if (error) {
    return {
      success: false,
      error: mapWeeklyHoursDbErrorMessage(error.code, error.message),
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Weekly hours block added." };
}

export async function updateWeeklyHours(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const rowId = parseRequiredUuid(String(formData.get("hoursId") ?? ""));
  if (!rowId) {
    return { success: false, error: "Invalid hours row.", message: null };
  }

  const parsed = weeklyHoursDraftFromInput({
    dayOfWeek: String(formData.get("dayOfWeek") ?? ""),
    opensAt: String(formData.get("opensAt") ?? ""),
    closesAt: String(formData.get("closesAt") ?? ""),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const draft = { ...parsed.value, id: rowId };

  const supabase = await createClient();
  const snapshot = await loadOperationsSnapshot(supabase);
  if (snapshot.error) {
    return {
      success: false,
      error: "Could not load weekly hours for validation.",
      message: null,
    };
  }

  const guard = validateWeeklyHoursMutation(snapshot.weeklyHours, snapshot.shifts, draft);
  if (!guard.ok) {
    return { success: false, error: guard.message, message: null };
  }

  const { error } = await supabase
    .from("weekly_hours")
    .update({
      day_of_week: draft.day_of_week,
      opens_at: draft.opens_at,
      closes_at: draft.closes_at,
    })
    .eq("id", rowId);

  if (error) {
    return {
      success: false,
      error: mapWeeklyHoursDbErrorMessage(error.code, error.message),
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Weekly hours updated." };
}

export async function deleteWeeklyHours(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const rowId = parseRequiredUuid(String(formData.get("hoursId") ?? ""));
  if (!rowId) {
    return { success: false, error: "Invalid hours row.", message: null };
  }

  const supabase = await createClient();
  const snapshot = await loadOperationsSnapshot(supabase);
  if (snapshot.error) {
    return {
      success: false,
      error: "Could not load weekly hours for validation.",
      message: null,
    };
  }

  const guard = validateWeeklyHoursDelete(snapshot.weeklyHours, snapshot.shifts, rowId);
  if (!guard.ok) {
    return { success: false, error: guard.message, message: null };
  }

  const { error } = await supabase.from("weekly_hours").delete().eq("id", rowId);

  if (error) {
    return {
      success: false,
      error: mapWeeklyHoursDbErrorMessage(error.code, error.message),
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Weekly hours block removed." };
}

export async function updateRestaurantTableActive(
  _prev: StaffOperationsMutationState,
  formData: FormData,
): Promise<StaffOperationsMutationState> {
  const access = await requireStaffManagerAccess();
  if (!access.ok) {
    return { success: false, error: access.error, message: null };
  }

  const parsed = validateTableToggleInput({
    tableId: String(formData.get("tableId") ?? ""),
    isActive: String(formData.get("isActive") ?? ""),
  });

  if (!parsed.ok) {
    return { success: false, error: parsed.message, message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ is_active: parsed.value.isActive })
    .eq("id", parsed.value.tableId);

  if (error) {
    return {
      success: false,
      error: "Could not update the table. Active assignments may block changes.",
      message: null,
    };
  }

  revalidateOperations();
  return { success: true, error: null, message: "Table updated." };
}
