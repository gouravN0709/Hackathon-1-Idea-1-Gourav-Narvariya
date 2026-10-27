-- =============================================================================
-- DEMO DATA ONLY — Iturrieta Sagardotegia development table inventory
-- =============================================================================
-- • This floor plan is invented for local development and testing.
-- • Do NOT use these labels, coordinates, or capacities as real restaurant inventory.
-- • After load, run supabase/seeds/staging_demo_configuration.sql to align Lunch
--   max_covers (24) and activate Thu–Sun shifts when staging guards pass.
-- • Replace or remove all demo rows before production go-live.
--
-- Inserts ONLY into public.restaurant_tables. Does not modify service_shifts,
-- weekly_hours, business_settings, reservations, staff, or credentials.
-- Apply only AFTER migration 20261026184605_restaurant_operations.sql succeeds.
-- Run in Supabase SQL Editor as postgres, or with service_role / CLI credentials.
-- =============================================================================

begin;

do $$
begin
  if exists (select 1 from public.restaurant_tables limit 1) then
    raise exception
      'restaurant_tables already contains rows. Demo seed refused to avoid overwriting existing inventory. Remove or migrate existing rows manually before loading demo data.';
  end if;
end $$;

insert into public.restaurant_tables (
  label,
  seat_count,
  position_x,
  position_y,
  width,
  height,
  rotation_degrees,
  shape,
  is_active,
  sort_order
) values
  ('Table 1', 2, 100, 100, 100, 70, 0, 'rectangle', true, 1),
  ('Table 2', 2, 240, 100, 100, 70, 0, 'rectangle', true, 2),
  ('Table 3', 2, 380, 100, 100, 70, 0, 'rectangle', true, 3),
  ('Table 4', 2, 100, 230, 100, 70, 0, 'rectangle', true, 4),
  ('Table 5', 6, 240, 230, 100, 70, 0, 'rectangle', true, 5),
  ('Table 6', 6, 380, 230, 100, 70, 0, 'rectangle', true, 6),
  ('Table 7', 6, 170, 370, 80, 80, 0, 'circle', true, 7),
  ('Table 8', 6, 320, 370, 80, 80, 0, 'circle', true, 8);

commit;

-- ---------------------------------------------------------------------------
-- Verification (read-only; run after the transaction succeeds)
-- Expected: active_table_count = 8, total_active_seats = 32, no duplicate labels
-- ---------------------------------------------------------------------------

select count(*) as active_table_count
from public.restaurant_tables
where is_active = true;

select coalesce(sum(seat_count), 0) as total_active_seats
from public.restaurant_tables
where is_active = true;

select
  lower(btrim(label)) as normalized_label,
  count(*) as row_count
from public.restaurant_tables
group by 1
having count(*) > 1;
