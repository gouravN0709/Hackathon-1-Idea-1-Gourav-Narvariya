-- Iturrieta Sagardotegia — operational seed TEMPLATE
-- Review only. Do not run until you confirm every CONFIRM_* value below.
-- Apply only AFTER migration 20261026184605_restaurant_operations.sql succeeds.
-- Run with a role that can write operational tables (service_role via server,
-- Supabase SQL editor as postgres, or CLI with appropriate credentials).
--
-- This file does not create staff users. See staff owner steps in project docs / setup guide.

begin;

-- ---------------------------------------------------------------------------
-- Weekly hours (ISO weekday: Mon=1 … Sun=7)
-- Suggested defaults match lib/site-config.ts diningHours (Thu–Sun, 13:00–16:00).
-- Confirm these match how the farm actually opens the cellar.
-- ---------------------------------------------------------------------------

-- CONFIRM: Are Thu–Sun 13:00–16:00 correct for weekly_hours?
insert into public.weekly_hours (day_of_week, opens_at, closes_at)
values
  (4, '13:00', '16:00'), -- Thursday
  (5, '13:00', '16:00'), -- Friday
  (6, '13:00', '16:00'), -- Saturday
  (7, '13:00', '16:00'); -- Sunday

-- ---------------------------------------------------------------------------
-- Service shifts (one bookable service per open day)
-- CONFIRM: shift name, max_covers, and exact starts_at / ends_at.
-- App readiness requires each shift to cover 13:00:00–16:00:00 (arrival slots).
-- ---------------------------------------------------------------------------

insert into public.service_shifts (name, day_of_week, starts_at, ends_at, max_covers, is_active)
values
  ('CONFIRM_THU_SHIFT_NAME', 4, '13:00', '16:00', CONFIRM_MAX_COVERS_THU, true),
  ('CONFIRM_FRI_SHIFT_NAME', 5, '13:00', '16:00', CONFIRM_MAX_COVERS_FRI, true),
  ('CONFIRM_SAT_SHIFT_NAME', 6, '13:00', '16:00', CONFIRM_MAX_COVERS_SAT, true),
  ('CONFIRM_SUN_SHIFT_NAME', 7, '13:00', '16:00', CONFIRM_MAX_COVERS_SUN, true);

-- ---------------------------------------------------------------------------
-- Restaurant tables
-- Use supabase/seeds/restaurant_tables.template.sql for table inventory only.
-- That file has constraints, verification queries, and safe bulk-load guards.
-- Do not duplicate table INSERTs here unless you intentionally combine seeds.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Optional: first staff owner (requires existing auth.users row)
-- CONFIRM: Supabase Auth user UUID and display name.
-- Inserts must run as service_role / postgres (see migration guard_staff_profile).
-- ---------------------------------------------------------------------------

-- insert into public.staff_profiles (user_id, role, display_name, is_active)
-- values (
--   'CONFIRM_AUTH_USER_UUID'::uuid,
--   'owner',
--   'CONFIRM_OWNER_DISPLAY_NAME',
--   true
-- );

commit;

-- After seeding, verify readiness from the app:
--   GET /api/bookings/status  →  { "live": true, "reason": null }
-- Until then, /book stays in prototype mode.
