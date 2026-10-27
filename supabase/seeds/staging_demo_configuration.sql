-- =============================================================================
-- DEMO / STAGING ONLY — Iturrieta Sagardotegia (SAGARDI hackathon project)
-- =============================================================================
-- Relabels the eight known demo table rows (sort_order 1–8), sets realistic seat
-- counts (32 total: four 2-seat + four 6-seat), sets Thu–Sun Lunch max_covers
-- to 24, and activates those shifts only when strict staging guards pass.
--
-- Does NOT change weekly_hours, business_settings.timezone, positions, staff,
-- reservations, or credentials. Safe to re-run after tables are already Table 1–8.
-- Run as postgres or service_role in Supabase SQL Editor, or via CLI.
-- =============================================================================

begin;

do $$
declare
  v_demo_label_rows integer;
  v_total_tables integer;
  v_total_shifts integer;
  v_reservations integer;
begin
  select count(*) into v_total_tables from public.restaurant_tables;
  select count(*) into v_total_shifts from public.service_shifts;
  select count(*) into v_reservations from public.reservations;

  if v_reservations > 0 then
    raise exception
      'staging_demo_configuration refused: % reservation row(s) exist. Resolve or migrate data before changing demo capacity.', v_reservations;
  end if;

  if v_total_tables <> 8 then
    raise exception
      'staging_demo_configuration refused: expected exactly 8 restaurant_tables rows (demo inventory), found %.', v_total_tables;
  end if;

  if v_total_shifts <> 4 then
    raise exception
      'staging_demo_configuration refused: expected exactly 4 service_shifts rows, found %.', v_total_shifts;
  end if;

  select count(*) into v_demo_label_rows
  from public.restaurant_tables
  where sort_order between 1 and 8
    and is_active = true
    and lower(btrim(label)) ~ '^demo table 0[1-8]$';

  if v_demo_label_rows not in (0, 8) then
    raise exception
      'staging_demo_configuration refused: expected 0 or 8 legacy Demo Table 0x labels among sort_order 1–8, found %.', v_demo_label_rows;
  end if;
end $$;

update public.restaurant_tables as t
set
  label = 'Table ' || t.sort_order::text,
  seat_count = case when t.sort_order <= 4 then 2 else 6 end,
  updated_at = now()
where t.sort_order between 1 and 8
  and t.is_active = true
  and (
    lower(btrim(t.label)) ~ '^demo table 0[1-8]$'
    or (
      t.label ~ '^Table [1-8]$'
      and t.seat_count is distinct from case when t.sort_order <= 4 then 2 else 6 end
    )
  );

update public.service_shifts as s
set
  max_covers = 24,
  updated_at = now()
where s.name = 'Lunch'
  and s.day_of_week in (4, 5, 6, 7)
  and s.starts_at = time '13:00:00'
  and s.ends_at = time '16:00:00';

do $$
declare
  v_staging_tables integer;
  v_staging_seats integer;
  v_timezone text;
begin
  select count(*), coalesce(sum(seat_count), 0)
  into v_staging_tables, v_staging_seats
  from public.restaurant_tables
  where is_active = true
    and sort_order between 1 and 8
    and label ~ '^Table [1-8]$'
    and seat_count = case when sort_order <= 4 then 2 else 6 end;

  if v_staging_tables <> 8 or v_staging_seats <> 32 then
    raise exception
      'staging demo table verification failed: need 8 active Table 1–8 rows totaling 32 seats (have % rows, % seats). Shifts left unchanged.', v_staging_tables, v_staging_seats;
  end if;

  select timezone into v_timezone from public.business_settings limit 1;
  if coalesce(v_timezone, '') <> 'Europe/Madrid' then
    raise exception
      'staging_demo_configuration refused shift activation: business_settings.timezone must remain Europe/Madrid (found %).', v_timezone;
  end if;

  update public.service_shifts as s
  set
    is_active = true,
    updated_at = now()
  where s.name = 'Lunch'
    and s.day_of_week in (4, 5, 6, 7)
    and s.starts_at = time '13:00:00'
    and s.ends_at = time '16:00:00'
    and s.max_covers <= v_staging_seats;
end $$;

commit;

-- Verification (read-only)
select label, seat_count, sort_order, position_x, position_y
from public.restaurant_tables
order by sort_order;

select name, day_of_week, starts_at, ends_at, max_covers, is_active
from public.service_shifts
order by day_of_week;

select coalesce(sum(seat_count), 0) as total_active_seats
from public.restaurant_tables
where is_active = true;
