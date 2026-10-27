-- Iturrieta Sagardotegia — restaurant_tables seed TEMPLATE (tables only)
-- Review only. Do not run until every CONFIRM_* placeholder is replaced with
-- real values from the farm's floor plan. This file does not touch shifts,
-- weekly_hours, reservations, business_settings, or credentials.
--
-- Apply only AFTER migration 20261026184605_restaurant_operations.sql succeeds.
-- Run with a role that can insert into public.restaurant_tables (service_role,
-- Supabase SQL editor as postgres, or CLI with appropriate credentials).
--
-- For hours, shifts, and staff, use supabase/seeds/operational_data.template.sql.
-- Use this file when you are ready to enter physical table inventory only.

-- ---------------------------------------------------------------------------
-- Collect from the farm (do not guess)
-- ---------------------------------------------------------------------------
-- For each physical table:
--   • label          — guest/staff-facing name (1–20 chars after trim; unique case-insensitively)
--   • seat_count     — seats at that table (integer 1–24)
--   • position_x/y   — floor-plan coordinates (numeric, −100000 … 100000)
--   • width, height  — display size on floor plan (positive numeric; defaults 80×80)
--   • rotation_degrees — 0 ≤ value < 360
--   • shape          — one of: rectangle | circle | square
--   • is_active      — only active tables count toward booking readiness and allocation
--   • sort_order     — nonnegative integer; booking picks tables by seat_count, not sort_order
--
-- Booking readiness (lib/booking/readiness.ts) requires:
--   • at least one active table with seat_count ≥ 1
--   • sum(seat_count) of active tables ≥ each active shift's max_covers on cellar days
-- Adjust max_covers on service_shifts separately after you know total active seats.

-- ---------------------------------------------------------------------------
-- Read-only checks BEFORE you insert (safe to run anytime)
-- ---------------------------------------------------------------------------

-- Current inventory (expect empty until first load)
select
  count(*) filter (where is_active) as active_table_count,
  coalesce(sum(seat_count) filter (where is_active), 0) as total_active_seats,
  count(*) as all_rows
from public.restaurant_tables;

-- Duplicate labels among existing rows (should return zero rows)
select
  lower(btrim(label)) as normalized_label,
  count(*) as row_count
from public.restaurant_tables
group by 1
having count(*) > 1;

-- Active shift cover limits vs current seating (informational; shifts not modified here)
select
  shift.name,
  shift.day_of_week,
  shift.max_covers,
  coalesce(
    (select sum(seat_count) from public.restaurant_tables where is_active),
    0
  ) as total_active_seats,
  shift.max_covers > coalesce(
    (select sum(seat_count) from public.restaurant_tables where is_active),
    0
  ) as max_covers_exceeds_seats
from public.service_shifts as shift
where shift.is_active
order by shift.day_of_week, shift.starts_at;

-- ---------------------------------------------------------------------------
-- Bulk first load (empty restaurant_tables only)
-- ---------------------------------------------------------------------------
-- • Replace the commented INSERT below with one row per real table.
-- • Do not copy placeholder text — every value must come from the farm layout.
-- • Labels in your INSERT must be unique (case-insensitive, trimmed).
-- • This block aborts if any row already exists, so rerunning the bulk script
--   does not silently duplicate or overwrite inventory. For later additions,
--   use single-row INSERTs and run the verification queries below.

begin;

do $$
begin
  if exists (select 1 from public.restaurant_tables limit 1) then
    raise exception
      'restaurant_tables already contains rows. Do not rerun this bulk template. Add new tables with individual INSERT statements after checking for label conflicts.';
  end if;
end $$;

-- Draft your rows here (uncomment and replace every CONFIRM_* token):
--
-- insert into public.restaurant_tables (
--   label,
--   seat_count,
--   position_x,
--   position_y,
--   width,
--   height,
--   rotation_degrees,
--   shape,
--   is_active,
--   sort_order
-- ) values
--   (
--     'CONFIRM_TABLE_LABEL_EXAMPLE',
--     CONFIRM_SEAT_COUNT,
--     CONFIRM_POSITION_X,
--     CONFIRM_POSITION_Y,
--     CONFIRM_WIDTH,
--     CONFIRM_HEIGHT,
--     CONFIRM_ROTATION_DEGREES,
--     'CONFIRM_SHAPE_rectangle_circle_or_square',
--     true,
--     CONFIRM_SORT_ORDER
--   );
-- Add one parenthesized row per table, comma-separated.

commit;

-- ---------------------------------------------------------------------------
-- Adding tables later (inventory already loaded)
-- ---------------------------------------------------------------------------
-- Do not rerun the transaction above. Example pattern:
--
-- begin;
-- insert into public.restaurant_tables (label, seat_count, position_x, position_y, shape, is_active, sort_order)
-- values ('CONFIRM_NEW_LABEL', CONFIRM_SEATS, CONFIRM_X, CONFIRM_Y, 'rectangle', true, CONFIRM_SORT);
-- commit;
--
-- A duplicate label (including case variants) fails the insert via
-- restaurant_tables_label_lower_idx and rolls back the transaction.

-- ---------------------------------------------------------------------------
-- Read-only verification AFTER real tables are entered
-- ---------------------------------------------------------------------------

-- 1) Active table count
select count(*) as active_table_count
from public.restaurant_tables
where is_active = true;

-- 2) Total active seats (readiness uses this sum)
select coalesce(sum(seat_count), 0) as total_active_seats
from public.restaurant_tables
where is_active = true;

-- 3) Duplicate labels (should return zero rows)
select
  lower(btrim(label)) as normalized_label,
  count(*) as row_count,
  array_agg(label order by label) as labels_seen
from public.restaurant_tables
group by 1
having count(*) > 1;

-- 4) Optional: list active inventory for manual review
select
  label,
  seat_count,
  shape,
  is_active,
  sort_order,
  position_x,
  position_y
from public.restaurant_tables
where is_active = true
order by sort_order, label;

-- App check (after service role is configured and shifts/hours are ready):
--   GET /api/bookings/status
