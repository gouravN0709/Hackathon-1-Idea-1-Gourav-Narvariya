-- =============================================================================
-- First owner staff profile — TEMPLATE (manual bootstrap only)
-- =============================================================================
-- Prerequisites:
--   1. Migration 20261026184605_restaurant_operations.sql is applied.
--   2. A Supabase Auth user already exists (Dashboard → Authentication → Users).
--   3. You have the Auth user's UUID (copy from the user detail panel).
--
-- Run this in the Supabase SQL Editor while connected as postgres, or via the
-- Supabase CLI with a role that bypasses RLS (service_role). Authenticated
-- sessions cannot insert into staff_profiles (see private.guard_staff_profile).
--
-- Replace CONFIRM_* placeholders before executing. Do not commit real UUIDs.
-- =============================================================================

begin;

-- Optional: confirm the Auth user exists before inserting.
-- select id, email from auth.users where id = 'CONFIRM_AUTH_USER_UUID'::uuid;

insert into public.staff_profiles (user_id, role, display_name, is_active)
values (
  'CONFIRM_AUTH_USER_UUID'::uuid,
  'owner',
  'CONFIRM_OWNER_DISPLAY_NAME',
  true
);

commit;

-- Verification (read-only):
-- select user_id, role, display_name, is_active
-- from public.staff_profiles
-- where user_id = 'CONFIRM_AUTH_USER_UUID'::uuid;
