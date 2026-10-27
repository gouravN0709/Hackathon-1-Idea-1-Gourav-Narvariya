-- Iturrieta Sagardotegia: restaurant operations schema.
-- Review only. Do not apply this file until the security notes are accepted.
--
-- No guest rows, staff rows, tables, shifts, or hours are inserted. The only
-- seed is one business_settings row whose timezone is Europe/Madrid.
-- Published dining hours stay in lib/site-config.ts until an owner copies
-- them into weekly_hours and adds a shift that fits those hours.
--
-- Lock order for capacity changes:
--   1. Existing reservation row, when the statement already updates one.
--   2. Transaction advisory lock (81421001, 26261026), the calendar lock.
--   3. service_capacity rows in (service_date, shift_id) order.
--   4. restaurant_tables rows in id order.
-- A table-only update locks that table row and does not take the calendar
-- lock, so it cannot cycle with a booking that already holds the calendar.
--
-- Writes that consume covers or tables go through private.create_reservation
-- and private.assign_reservation_tables. Both are security definer and are
-- reached only from public wrappers that accept the service_role. Row locks,
-- the unique active-table index, and service_capacity.reserved_covers <=
-- max_covers are what stop two concurrent bookings from overbooking.
--
-- RLS is enabled and not forced. Forcing it would put the table owner under
-- the same policies and break the security definer lookups. anon and
-- authenticated do not bypass RLS. service_role and the migration owner do.

set search_path = public, extensions, pg_catalog;

create extension if not exists btree_gist with schema extensions;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- Hours and shifts store local times. This converts a time-of-day to seconds
-- so a GiST exclusion constraint can reject overlapping ranges.
create function private.time_to_seconds(p_time time)
returns integer
language sql
immutable
strict
set search_path = ''
as $$
  select (
    (pg_catalog.date_part('hour', p_time)::integer * 3600)
    + (pg_catalog.date_part('minute', p_time)::integer * 60)
    + pg_catalog.floor(pg_catalog.date_part('second', p_time))::integer
  );
$$;

create function private.reservation_holds_capacity(p_status text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_status in ('pending', 'confirmed', 'seated', 'completed');
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_settings_singleton check (singleton),
  constraint business_settings_one_row unique (singleton),
  constraint business_settings_timezone_length check (char_length(timezone) between 1 and 64)
);

create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_user_id_key unique (user_id),
  constraint staff_profiles_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade,
  constraint staff_profiles_role_check
    check (role in ('owner', 'manager', 'staff')),
  constraint staff_profiles_display_name_length
    check (char_length(btrim(display_name)) between 1 and 80)
);

-- True only when the signed-in user has one of the named active roles.
-- security definer reads staff_profiles without re-entering its RLS policy.
create function private.has_staff_role(allowed text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = (select auth.uid())
      and is_active
      and role = any (allowed)
  );
$$;

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_display_name_length
    check (char_length(btrim(display_name)) between 2 and 80),
  constraint guests_display_name_letter
    check (btrim(display_name) ~ '[[:alpha:]]')
);

create table public.guest_contacts (
  guest_id uuid primary key,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_contacts_guest_id_fkey
    foreign key (guest_id) references public.guests (id) on delete cascade,
  constraint guest_contacts_email_shape check (
    char_length(email) between 3 and 254
    and email = lower(email)
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  constraint guest_contacts_phone_length
    check (char_length(btrim(phone)) between 8 and 32)
);

create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  seat_count integer not null,
  position_x numeric(8, 2) not null default 0,
  position_y numeric(8, 2) not null default 0,
  width numeric(8, 2) not null default 80,
  height numeric(8, 2) not null default 80,
  rotation_degrees numeric(5, 2) not null default 0,
  shape text not null default 'rectangle',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_tables_label_length
    check (char_length(btrim(label)) between 1 and 20),
  constraint restaurant_tables_seat_count_bounds
    check (seat_count between 1 and 24),
  constraint restaurant_tables_position_bounds check (
    position_x between -100000 and 100000
    and position_y between -100000 and 100000
  ),
  constraint restaurant_tables_size_positive
    check (width > 0 and height > 0),
  constraint restaurant_tables_rotation_bounds
    check (rotation_degrees >= 0 and rotation_degrees < 360),
  constraint restaurant_tables_shape_check
    check (shape in ('rectangle', 'circle', 'square')),
  constraint restaurant_tables_sort_order_nonnegative
    check (sort_order >= 0)
);

create unique index restaurant_tables_label_lower_idx
  on public.restaurant_tables (lower(btrim(label)));

-- day_of_week uses ISO numbering: 1 Monday through 7 Sunday.
-- The public site uses JavaScript's Sunday = 0. Thursday is 4 here and in
-- lib/site-config.ts, Friday 5, Saturday 6, and Sunday is 7 here (0 there).
create table public.weekly_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null,
  opens_at time not null,
  closes_at time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_hours_day_check check (day_of_week between 1 and 7),
  constraint weekly_hours_range_check check (opens_at < closes_at),
  constraint weekly_hours_no_overlap exclude using gist (
    day_of_week extensions.gist_int2_ops with =,
    int4range(
      private.time_to_seconds(opens_at),
      private.time_to_seconds(closes_at),
      '[)'
    ) with &&
  )
);

create table public.service_shifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  day_of_week smallint not null,
  starts_at time not null,
  ends_at time not null,
  max_covers integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_shifts_name_length
    check (char_length(btrim(name)) between 1 and 40),
  constraint service_shifts_day_check check (day_of_week between 1 and 7),
  constraint service_shifts_range_check check (starts_at < ends_at),
  constraint service_shifts_max_covers_bounds
    check (max_covers between 1 and 500),
  constraint service_shifts_active_no_overlap exclude using gist (
    day_of_week extensions.gist_int2_ops with =,
    int4range(
      private.time_to_seconds(starts_at),
      private.time_to_seconds(ends_at),
      '[)'
    ) with &&
  ) where (is_active)
);

create unique index service_shifts_day_name_idx
  on public.service_shifts (day_of_week, lower(btrim(name)));

create index service_shifts_day_idx
  on public.service_shifts (day_of_week, starts_at);

create table public.special_closures (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  shift_id uuid,
  reason text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint special_closures_shift_id_fkey
    foreign key (shift_id) references public.service_shifts (id) on delete cascade,
  constraint special_closures_range_check check (starts_on <= ends_on),
  constraint special_closures_reason_length
    check (char_length(btrim(reason)) between 1 and 200)
);

create index special_closures_shift_id_idx
  on public.special_closures (shift_id);

create index special_closures_span_idx
  on public.special_closures
  using gist (daterange(starts_on, ends_on, '[]'));

create table public.service_capacity (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  shift_id uuid not null,
  max_covers integer not null,
  reserved_covers integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_capacity_shift_id_fkey
    foreign key (shift_id) references public.service_shifts (id) on delete restrict,
  constraint service_capacity_service_key unique (service_date, shift_id),
  constraint service_capacity_max_covers_bounds
    check (max_covers between 1 and 500),
  constraint service_capacity_reserved_nonnegative
    check (reserved_covers >= 0),
  constraint service_capacity_not_overbooked
    check (reserved_covers <= max_covers)
);

create index service_capacity_shift_id_idx
  on public.service_capacity (shift_id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null,
  service_date date not null,
  shift_id uuid not null,
  arrival_time time not null,
  adult_count integer not null,
  child_count integer not null,
  party_size integer generated always as (adult_count + child_count) stored not null,
  status text not null default 'confirmed',
  notes text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_guest_id_fkey
    foreign key (guest_id) references public.guests (id) on delete restrict,
  constraint reservations_shift_id_fkey
    foreign key (shift_id) references public.service_shifts (id) on delete restrict,
  constraint reservations_adult_count_bounds
    check (adult_count between 1 and 11),
  constraint reservations_child_count_bounds
    check (child_count between 0 and 6),
  constraint reservations_status_check check (
    status in (
      'pending',
      'confirmed',
      'seated',
      'completed',
      'cancelled',
      'no_show'
    )
  ),
  constraint reservations_notes_length
    check (notes is null or char_length(notes) <= 800),
  constraint reservations_terminal_timestamp check (
    (
      status in ('cancelled', 'no_show')
      and cancelled_at is not null
    )
    or (
      status not in ('cancelled', 'no_show')
      and cancelled_at is null
    )
  )
);

create index reservations_guest_id_idx
  on public.reservations (guest_id);

create index reservations_shift_id_idx
  on public.reservations (shift_id);

create index reservations_service_idx
  on public.reservations (service_date, shift_id);

-- Status list must stay aligned with private.reservation_holds_capacity.
create index reservations_active_service_idx
  on public.reservations (service_date, shift_id)
  include (party_size)
  where status in ('pending', 'confirmed', 'seated', 'completed');

create table public.table_assignments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null,
  table_id uuid not null,
  service_date date not null,
  shift_id uuid not null,
  assigned_at timestamptz not null default now(),
  released_at timestamptz,
  constraint table_assignments_reservation_id_fkey
    foreign key (reservation_id) references public.reservations (id) on delete cascade,
  constraint table_assignments_table_id_fkey
    foreign key (table_id) references public.restaurant_tables (id) on delete restrict,
  constraint table_assignments_shift_id_fkey
    foreign key (shift_id) references public.service_shifts (id) on delete restrict,
  constraint table_assignments_release_order
    check (released_at is null or released_at >= assigned_at)
);

create index table_assignments_reservation_id_idx
  on public.table_assignments (reservation_id);

create index table_assignments_table_id_idx
  on public.table_assignments (table_id);

create index table_assignments_shift_id_idx
  on public.table_assignments (shift_id);

create unique index table_assignments_active_table_idx
  on public.table_assignments (table_id, service_date, shift_id)
  where released_at is null;

create unique index table_assignments_active_pair_idx
  on public.table_assignments (reservation_id, table_id)
  where released_at is null;

create index guest_contacts_email_idx
  on public.guest_contacts (email);

create function private.lock_calendar()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.set_config('lock_timeout', '4000', true);
  perform pg_catalog.pg_advisory_xact_lock(81421001, 26261026);
end;
$$;

create function private.lock_tables(p_table_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform dining_table.id
  from public.restaurant_tables as dining_table
  where dining_table.id = any (p_table_ids)
  order by dining_table.id
  for update;
end;
$$;

create function private.assert_slot_open(
  p_service_date date,
  p_shift_id uuid,
  p_arrival_time time
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_timezone text;
  v_today date;
  v_day integer;
  v_starts time;
  v_ends time;
  v_active boolean;
  v_shift_day smallint;
begin
  select settings.timezone
  into v_timezone
  from public.business_settings as settings
  limit 1;

  if v_timezone is null or p_service_date is null or p_shift_id is null or p_arrival_time is null then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  v_today := (pg_catalog.now() at time zone v_timezone)::date;

  if p_service_date < v_today then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  v_day := pg_catalog.date_part('isodow', p_service_date)::integer;

  select shift.starts_at, shift.ends_at, shift.is_active, shift.day_of_week
  into v_starts, v_ends, v_active, v_shift_day
  from public.service_shifts as shift
  where shift.id = p_shift_id;

  if not found or v_active is not true or v_shift_day <> v_day then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  if p_arrival_time < v_starts or p_arrival_time >= v_ends then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.weekly_hours as hours
    where hours.day_of_week = v_day
      and hours.opens_at <= v_starts
      and hours.closes_at >= v_ends
  ) then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.special_closures as closure
    where p_service_date between closure.starts_on and closure.ends_on
      and (closure.shift_id is null or closure.shift_id = p_shift_id)
  ) then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;
end;
$$;

create function private.lock_and_recompute_capacity(
  p_service_date date,
  p_shift_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_max integer;
  v_held integer;
begin
  perform private.lock_calendar();

  select shift.max_covers
  into v_max
  from public.service_shifts as shift
  where shift.id = p_shift_id;

  if not found then
    raise exception 'service is not bookable'
      using errcode = '23514';
  end if;

  insert into public.service_capacity (service_date, shift_id, max_covers)
  values (p_service_date, p_shift_id, v_max)
  on conflict (service_date, shift_id) do nothing;

  perform capacity.id
  from public.service_capacity as capacity
  where capacity.service_date = p_service_date
    and capacity.shift_id = p_shift_id
  for update;

  select pg_catalog.coalesce(pg_catalog.sum(reservation.party_size), 0)::integer
  into v_held
  from public.reservations as reservation
  where reservation.service_date = p_service_date
    and reservation.shift_id = p_shift_id
    and reservation.status in ('pending', 'confirmed', 'seated', 'completed');

  if v_held > v_max then
    raise exception 'service is full'
      using errcode = '23514';
  end if;

  update public.service_capacity
  set max_covers = v_max,
      reserved_covers = v_held
  where service_date = p_service_date
    and shift_id = p_shift_id;
end;
$$;

create function private.guard_staff_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in (
    'service_role',
    'postgres',
    'supabase_admin',
    'supabase_auth_admin'
  ) then
    raise exception 'staff profiles are changed from the server'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE'
    or (
      tg_op = 'UPDATE'
      and old.role = 'owner'
      and old.is_active
      and (new.role <> 'owner' or not new.is_active)
    ) then
    if (
      select pg_catalog.count(*)
      from public.staff_profiles as profile
      where profile.role = 'owner'
        and profile.is_active
        and profile.id <> old.id
    ) = 0 then
      raise exception 'the last active owner cannot be removed'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create function private.guard_business_settings()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'business settings cannot be removed'
      using errcode = '23514';
  end if;

  if new.singleton is not true then
    raise exception 'business settings cannot be removed'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone
  ) then
    raise exception 'timezone must be a recognized IANA name'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create function private.guard_restaurant_table()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and (
      new.seat_count < old.seat_count
      or (old.is_active and not new.is_active)
    )
    and exists (
      select 1
      from public.table_assignments as assignment
      join public.reservations as reservation
        on reservation.id = assignment.reservation_id
      where assignment.table_id = old.id
        and assignment.released_at is null
        and reservation.status in ('pending', 'confirmed', 'seated', 'completed')
    ) then
    raise exception 'table seats are in use'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create function private.guard_weekly_hours()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.lock_calendar();

  if tg_when = 'BEFORE' then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  if exists (
    select 1
    from public.service_shifts as shift
    where shift.is_active
      and not exists (
        select 1
        from public.weekly_hours as hours
        where hours.day_of_week = shift.day_of_week
          and hours.opens_at <= shift.starts_at
          and hours.closes_at >= shift.ends_at
      )
  ) then
    raise exception 'shift falls outside weekly hours'
      using errcode = '23514';
  end if;

  return null;
end;
$$;

create function private.guard_service_shift()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.lock_calendar();

  if tg_op = 'DELETE' then
    return old;
  end if;

  if new.is_active
    and not exists (
      select 1
      from public.weekly_hours as hours
      where hours.day_of_week = new.day_of_week
        and hours.opens_at <= new.starts_at
        and hours.closes_at >= new.ends_at
    ) then
    raise exception 'shift falls outside weekly hours'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
    and (
      old.day_of_week is distinct from new.day_of_week
      or old.starts_at is distinct from new.starts_at
      or old.ends_at is distinct from new.ends_at
      or (old.is_active and not new.is_active)
    )
    and exists (
      select 1
      from public.reservations as reservation
      where reservation.shift_id = new.id
        and reservation.status in ('pending', 'confirmed', 'seated', 'completed')
    ) then
    raise exception 'shift is already booked'
      using errcode = '23514';
  end if;

  if tg_op = 'UPDATE'
    and new.max_covers < old.max_covers
    and exists (
      select 1
      from public.reservations as reservation
      where reservation.shift_id = new.id
        and reservation.status in ('pending', 'confirmed', 'seated', 'completed')
      group by reservation.service_date
      having pg_catalog.sum(reservation.party_size) > new.max_covers
    ) then
    raise exception 'shift capacity is below existing reservations'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create function private.sync_shift_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_date date;
begin
  if tg_op = 'UPDATE' and old.max_covers is distinct from new.max_covers then
    for v_date in
      select capacity.service_date
      from public.service_capacity as capacity
      where capacity.shift_id = new.id
      order by capacity.service_date
    loop
      perform private.lock_and_recompute_capacity(v_date, new.id);
    end loop;
  end if;

  return null;
end;
$$;

create function private.guard_special_closure()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.lock_calendar();

  if tg_op in ('INSERT', 'UPDATE')
    and exists (
      select 1
      from public.reservations as reservation
      where reservation.service_date between new.starts_on and new.ends_on
        and (new.shift_id is null or reservation.shift_id = new.shift_id)
        and reservation.status in ('pending', 'confirmed', 'seated', 'completed')
    ) then
    raise exception 'closure overlaps existing reservations'
      using errcode = '23514';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create function private.prepare_reservation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin')
    and tg_op = 'UPDATE'
    and (
      new.guest_id is distinct from old.guest_id
      or new.service_date is distinct from old.service_date
      or new.shift_id is distinct from old.shift_id
      or new.arrival_time is distinct from old.arrival_time
      or new.adult_count is distinct from old.adult_count
      or new.child_count is distinct from old.child_count
    ) then
    raise exception 'reservation details are changed from the server'
      using errcode = '42501';
  end if;

  if private.reservation_holds_capacity(new.status) then
    new.cancelled_at := null;
  elsif tg_op = 'INSERT' or old.cancelled_at is null then
    new.cancelled_at := pg_catalog.now();
  else
    new.cancelled_at := old.cancelled_at;
  end if;

  return new;
end;
$$;

create function private.sync_reservation_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and old.status is not distinct from new.status
    and old.service_date is not distinct from new.service_date
    and old.shift_id is not distinct from new.shift_id
    and old.arrival_time is not distinct from new.arrival_time
    and old.adult_count is not distinct from new.adult_count
    and old.child_count is not distinct from new.child_count then
    return null;
  end if;

  if tg_op = 'UPDATE'
    and new.party_size > old.party_size
    and private.reservation_holds_capacity(new.status)
    and exists (
      select 1
      from public.table_assignments as assignment
      where assignment.reservation_id = new.id
        and assignment.released_at is null
    ) then
    perform private.lock_calendar();
    perform private.lock_tables(array(
      select assignment.table_id
      from public.table_assignments as assignment
      where assignment.reservation_id = new.id
        and assignment.released_at is null
    ));

    if pg_catalog.coalesce((
      select pg_catalog.sum(dining_table.seat_count)
      from public.table_assignments as assignment
      join public.restaurant_tables as dining_table
        on dining_table.id = assignment.table_id
      where assignment.reservation_id = new.id
        and assignment.released_at is null
    ), 0) < new.party_size then
      raise exception 'tables do not cover the party'
        using errcode = '23514';
    end if;
  end if;

  if tg_op <> 'DELETE'
    and private.reservation_holds_capacity(new.status)
    and (
      tg_op = 'INSERT'
      or not private.reservation_holds_capacity(old.status)
      or old.service_date is distinct from new.service_date
      or old.shift_id is distinct from new.shift_id
      or old.arrival_time is distinct from new.arrival_time
    ) then
    perform private.assert_slot_open(new.service_date, new.shift_id, new.arrival_time);
  end if;

  if tg_op = 'UPDATE'
    and (
      old.service_date is distinct from new.service_date
      or old.shift_id is distinct from new.shift_id
    ) then
    if exists (
      select 1
      from public.table_assignments as assignment
      where assignment.reservation_id = new.id
        and assignment.released_at is null
    ) then
      raise exception 'release tables before moving a reservation'
        using errcode = '23514';
    end if;

    if (old.service_date, old.shift_id) <= (new.service_date, new.shift_id) then
      perform private.lock_and_recompute_capacity(old.service_date, old.shift_id);
      perform private.lock_and_recompute_capacity(new.service_date, new.shift_id);
    else
      perform private.lock_and_recompute_capacity(new.service_date, new.shift_id);
      perform private.lock_and_recompute_capacity(old.service_date, old.shift_id);
    end if;
  elsif tg_op = 'DELETE' then
    perform private.lock_and_recompute_capacity(old.service_date, old.shift_id);
  else
    perform private.lock_and_recompute_capacity(new.service_date, new.shift_id);
  end if;

  return null;
end;
$$;

create function private.release_tables_when_reservation_ends()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
    and private.reservation_holds_capacity(old.status)
    and not private.reservation_holds_capacity(new.status) then
    perform private.lock_calendar();

    update public.table_assignments
    set released_at = pg_catalog.now()
    where reservation_id = new.id
      and released_at is null;
  end if;

  return null;
end;
$$;

create function private.prepare_table_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_service_date date;
  v_shift_id uuid;
begin
  select reservation.service_date, reservation.shift_id
  into v_service_date, v_shift_id
  from public.reservations as reservation
  where reservation.id = new.reservation_id;

  if v_service_date is null then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  new.service_date := v_service_date;
  new.shift_id := v_shift_id;
  return new;
end;
$$;

create function private.create_reservation(
  p_service_date date,
  p_shift_id uuid,
  p_arrival_time time,
  p_adult_count integer,
  p_child_count integer,
  p_table_ids uuid[],
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_guest_id uuid;
  v_reservation_id uuid;
  v_party integer;
  v_table_count integer;
  v_constraint text;
begin
  perform pg_catalog.set_config('statement_timeout', '5000', true);

  if p_table_ids is null
    or pg_catalog.cardinality(p_table_ids) < 1
    or p_adult_count is null
    or p_adult_count < 1
    or p_adult_count > 11
    or p_child_count is null
    or p_child_count < 0
    or p_child_count > 6
    or p_guest_name is null
    or pg_catalog.char_length(pg_catalog.btrim(p_guest_name)) < 2
    or pg_catalog.char_length(pg_catalog.btrim(p_guest_name)) > 80
    or pg_catalog.btrim(p_guest_name) !~ '[[:alpha:]]'
    or p_guest_email is null
    or pg_catalog.char_length(pg_catalog.btrim(p_guest_email)) > 254
    or pg_catalog.btrim(p_guest_email) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    or p_guest_phone is null
    or pg_catalog.char_length(
      pg_catalog.regexp_replace(p_guest_phone, '\D', '', 'g')
    ) < 8
    or pg_catalog.char_length(
      pg_catalog.regexp_replace(p_guest_phone, '\D', '', 'g')
    ) > 15
    or (p_notes is not null and pg_catalog.char_length(p_notes) > 800)
  then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  select pg_catalog.count(*)
  into v_table_count
  from (
    select distinct selected.table_id
    from pg_catalog.unnest(p_table_ids) as selected(table_id)
  ) as distinct_tables;

  if v_table_count <> pg_catalog.cardinality(p_table_ids) then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  perform private.lock_calendar();
  perform private.assert_slot_open(p_service_date, p_shift_id, p_arrival_time);
  perform private.lock_tables(p_table_ids);

  if (
    select pg_catalog.count(*)
    from public.restaurant_tables as dining_table
    where dining_table.id = any (p_table_ids)
      and dining_table.is_active
  ) <> pg_catalog.cardinality(p_table_ids) then
    raise exception 'table is not available'
      using errcode = '23514';
  end if;

  v_party := p_adult_count + p_child_count;

  if pg_catalog.coalesce((
    select pg_catalog.sum(dining_table.seat_count)
    from public.restaurant_tables as dining_table
    where dining_table.id = any (p_table_ids)
  ), 0) < v_party then
    raise exception 'tables do not cover the party'
      using errcode = '23514';
  end if;

  perform private.lock_and_recompute_capacity(p_service_date, p_shift_id);

  if exists (
    select 1
    from public.service_capacity as capacity
    where capacity.service_date = p_service_date
      and capacity.shift_id = p_shift_id
      and capacity.reserved_covers + v_party > capacity.max_covers
  ) then
    raise exception 'service is full'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.table_assignments as assignment
    where assignment.table_id = any (p_table_ids)
      and assignment.service_date = p_service_date
      and assignment.shift_id = p_shift_id
      and assignment.released_at is null
  ) then
    raise exception 'table is already assigned'
      using errcode = '23505';
  end if;

  insert into public.guests (display_name)
  values (pg_catalog.btrim(p_guest_name))
  returning id into v_guest_id;

  insert into public.guest_contacts (guest_id, email, phone)
  values (
    v_guest_id,
    pg_catalog.lower(pg_catalog.btrim(p_guest_email)),
    pg_catalog.btrim(p_guest_phone)
  );

  insert into public.reservations (
    guest_id,
    service_date,
    shift_id,
    arrival_time,
    adult_count,
    child_count,
    status,
    notes
  )
  values (
    v_guest_id,
    p_service_date,
    p_shift_id,
    p_arrival_time,
    p_adult_count,
    p_child_count,
    'confirmed',
    nullif(pg_catalog.btrim(pg_catalog.coalesce(p_notes, '')), '')
  )
  returning id into v_reservation_id;

  insert into public.table_assignments (reservation_id, table_id)
  select v_reservation_id, selected.table_id
  from pg_catalog.unnest(p_table_ids) as selected(table_id);

  return v_reservation_id;
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;

    if v_constraint in (
      'table_assignments_active_table_idx',
      'table_assignments_active_pair_idx'
    ) then
      raise exception 'table is already assigned'
        using errcode = '23505';
    end if;

    raise exception 'reservation could not be saved'
      using errcode = '23505';
end;
$$;

create function private.assign_reservation_tables(
  p_reservation_id uuid,
  p_table_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_service_date date;
  v_shift_id uuid;
  v_party integer;
  v_table_count integer;
  v_lock_ids uuid[];
  v_constraint text;
begin
  perform pg_catalog.set_config('statement_timeout', '5000', true);

  if p_reservation_id is null
    or p_table_ids is null
    or pg_catalog.cardinality(p_table_ids) < 1 then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  select pg_catalog.count(*)
  into v_table_count
  from (
    select distinct selected.table_id
    from pg_catalog.unnest(p_table_ids) as selected(table_id)
  ) as distinct_tables;

  if v_table_count <> pg_catalog.cardinality(p_table_ids) then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  select
    reservation.status,
    reservation.service_date,
    reservation.shift_id,
    reservation.party_size
  into v_status, v_service_date, v_shift_id, v_party
  from public.reservations as reservation
  where reservation.id = p_reservation_id
  for update;

  if not found or not private.reservation_holds_capacity(v_status) then
    raise exception 'reservation could not be saved'
      using errcode = '23514';
  end if;

  select pg_catalog.array_agg(selected.table_id order by selected.table_id)
  into v_lock_ids
  from (
    select assignment.table_id
    from public.table_assignments as assignment
    where assignment.reservation_id = p_reservation_id
      and assignment.released_at is null
    union
    select unnested.table_id
    from pg_catalog.unnest(p_table_ids) as unnested(table_id)
  ) as selected;

  perform private.lock_calendar();
  perform private.lock_and_recompute_capacity(v_service_date, v_shift_id);
  perform private.lock_tables(v_lock_ids);

  if (
    select pg_catalog.count(*)
    from public.restaurant_tables as dining_table
    where dining_table.id = any (p_table_ids)
      and dining_table.is_active
  ) <> pg_catalog.cardinality(p_table_ids) then
    raise exception 'table is not available'
      using errcode = '23514';
  end if;

  if pg_catalog.coalesce((
    select pg_catalog.sum(dining_table.seat_count)
    from public.restaurant_tables as dining_table
    where dining_table.id = any (p_table_ids)
  ), 0) < v_party then
    raise exception 'tables do not cover the party'
      using errcode = '23514';
  end if;

  update public.table_assignments
  set released_at = pg_catalog.now()
  where reservation_id = p_reservation_id
    and released_at is null
    and not (table_id = any (p_table_ids));

  insert into public.table_assignments (reservation_id, table_id)
  select p_reservation_id, selected.table_id
  from pg_catalog.unnest(p_table_ids) as selected(table_id)
  where not exists (
    select 1
    from public.table_assignments as assignment
    where assignment.reservation_id = p_reservation_id
      and assignment.table_id = selected.table_id
      and assignment.released_at is null
  );
exception
  when unique_violation then
    get stacked diagnostics v_constraint = constraint_name;

    if v_constraint in (
      'table_assignments_active_table_idx',
      'table_assignments_active_pair_idx'
    ) then
      raise exception 'table is already assigned'
        using errcode = '23505';
    end if;

    raise exception 'reservation could not be saved'
      using errcode = '23505';
end;
$$;

create function public.create_reservation(
  p_service_date date,
  p_shift_id uuid,
  p_arrival_time time,
  p_adult_count integer,
  p_child_count integer,
  p_table_ids uuid[],
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user is distinct from 'service_role' then
    raise exception 'reservation changes are server-only'
      using errcode = '42501';
  end if;

  return private.create_reservation(
    p_service_date,
    p_shift_id,
    p_arrival_time,
    p_adult_count,
    p_child_count,
    p_table_ids,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_notes
  );
end;
$$;

create function public.assign_reservation_tables(
  p_reservation_id uuid,
  p_table_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user is distinct from 'service_role' then
    raise exception 'reservation changes are server-only'
      using errcode = '42501';
  end if;

  perform private.assign_reservation_tables(p_reservation_id, p_table_ids);
end;
$$;

create trigger staff_profiles_guard
  before insert or update or delete on public.staff_profiles
  for each row execute function private.guard_staff_profile();

create trigger business_settings_guard
  before insert or update or delete on public.business_settings
  for each row execute function private.guard_business_settings();

create trigger restaurant_tables_guard
  before update or delete on public.restaurant_tables
  for each row execute function private.guard_restaurant_table();

create trigger weekly_hours_guard
  before insert or update or delete on public.weekly_hours
  for each row execute function private.guard_weekly_hours();

create trigger weekly_hours_cover_shifts
  after insert or update or delete on public.weekly_hours
  for each row execute function private.guard_weekly_hours();

create trigger service_shifts_guard
  before insert or update or delete on public.service_shifts
  for each row execute function private.guard_service_shift();

create trigger service_shifts_sync_capacity
  after update on public.service_shifts
  for each row execute function private.sync_shift_capacity();

create trigger special_closures_guard
  before insert or update or delete on public.special_closures
  for each row execute function private.guard_special_closure();

create trigger reservations_prepare
  before insert or update on public.reservations
  for each row execute function private.prepare_reservation();

create trigger reservations_release_tables
  after update on public.reservations
  for each row execute function private.release_tables_when_reservation_ends();

create trigger reservations_sync_capacity
  after insert or update or delete on public.reservations
  for each row execute function private.sync_reservation_capacity();

create trigger table_assignments_prepare
  before insert on public.table_assignments
  for each row execute function private.prepare_table_assignment();

do $$
declare
  target text;
begin
  foreach target in array array[
    'business_settings',
    'staff_profiles',
    'guests',
    'guest_contacts',
    'restaurant_tables',
    'weekly_hours',
    'service_shifts',
    'special_closures',
    'service_capacity',
    'reservations'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function private.set_updated_at()',
      target || '_set_updated_at',
      target
    );
  end loop;
end;
$$;

alter table public.business_settings enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.guests enable row level security;
alter table public.guest_contacts enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.weekly_hours enable row level security;
alter table public.service_shifts enable row level security;
alter table public.special_closures enable row level security;
alter table public.service_capacity enable row level security;
alter table public.reservations enable row level security;
alter table public.table_assignments enable row level security;

create policy business_settings_staff_select
  on public.business_settings
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy business_settings_owner_update
  on public.business_settings
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner'])))
  with check (
    (select private.has_staff_role(array['owner']))
    and singleton
  );

create policy staff_profiles_select
  on public.staff_profiles
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.has_staff_role(array['owner', 'manager']))
  );

create policy guests_manager_select
  on public.guests
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy guests_floor_select
  on public.guests
  for select
  to authenticated
  using (
    (select private.has_staff_role(array['staff']))
    and exists (
      select 1
      from public.reservations as reservation
      where reservation.guest_id = guests.id
    )
  );

create policy guest_contacts_manager_select
  on public.guest_contacts
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy restaurant_tables_staff_select
  on public.restaurant_tables
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy restaurant_tables_manager_insert
  on public.restaurant_tables
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy restaurant_tables_manager_update
  on public.restaurant_tables
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])))
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy restaurant_tables_manager_delete
  on public.restaurant_tables
  for delete
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy weekly_hours_staff_select
  on public.weekly_hours
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy weekly_hours_manager_insert
  on public.weekly_hours
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy weekly_hours_manager_update
  on public.weekly_hours
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])))
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy weekly_hours_manager_delete
  on public.weekly_hours
  for delete
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy service_shifts_staff_select
  on public.service_shifts
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy service_shifts_manager_insert
  on public.service_shifts
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy service_shifts_manager_update
  on public.service_shifts
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])))
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy service_shifts_manager_delete
  on public.service_shifts
  for delete
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy special_closures_staff_select
  on public.special_closures
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy special_closures_manager_insert
  on public.special_closures
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy special_closures_manager_update
  on public.special_closures
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])))
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy special_closures_manager_delete
  on public.special_closures
  for delete
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy service_capacity_staff_select
  on public.service_capacity
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy reservations_staff_select
  on public.reservations
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy reservations_staff_update
  on public.reservations
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])))
  with check ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy table_assignments_staff_select
  on public.table_assignments
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

revoke all on table public.business_settings from public, anon, authenticated, service_role;
revoke all on table public.staff_profiles from public, anon, authenticated, service_role;
revoke all on table public.guests from public, anon, authenticated, service_role;
revoke all on table public.guest_contacts from public, anon, authenticated, service_role;
revoke all on table public.restaurant_tables from public, anon, authenticated, service_role;
revoke all on table public.weekly_hours from public, anon, authenticated, service_role;
revoke all on table public.service_shifts from public, anon, authenticated, service_role;
revoke all on table public.special_closures from public, anon, authenticated, service_role;
revoke all on table public.service_capacity from public, anon, authenticated, service_role;
revoke all on table public.reservations from public, anon, authenticated, service_role;
revoke all on table public.table_assignments from public, anon, authenticated, service_role;

grant select on table public.business_settings to authenticated;
grant update (timezone, updated_at) on table public.business_settings to authenticated;

grant select on table public.staff_profiles to authenticated;

grant select on table public.guests to authenticated;
grant select on table public.guest_contacts to authenticated;

grant select, insert, delete on table public.restaurant_tables to authenticated;
grant update (
  label,
  seat_count,
  position_x,
  position_y,
  width,
  height,
  rotation_degrees,
  shape,
  is_active,
  sort_order,
  updated_at
) on table public.restaurant_tables to authenticated;

grant select, insert, delete on table public.weekly_hours to authenticated;
grant update (day_of_week, opens_at, closes_at, updated_at)
  on table public.weekly_hours to authenticated;

grant select, insert, delete on table public.service_shifts to authenticated;
grant update (
  name,
  day_of_week,
  starts_at,
  ends_at,
  max_covers,
  is_active,
  updated_at
) on table public.service_shifts to authenticated;

grant select, insert, delete on table public.special_closures to authenticated;
grant update (starts_on, ends_on, shift_id, reason, updated_at)
  on table public.special_closures to authenticated;

grant select on table public.service_capacity to authenticated;

grant select on table public.reservations to authenticated;
grant update (status, notes, cancelled_at, updated_at)
  on table public.reservations to authenticated;

grant select on table public.table_assignments to authenticated;

grant select, update, delete on table public.business_settings to service_role;
grant select, insert, update, delete on table public.staff_profiles to service_role;
grant select, update, delete on table public.guests to service_role;
grant select, update, delete on table public.guest_contacts to service_role;
grant select, insert, update, delete on table public.restaurant_tables to service_role;
grant select, insert, update, delete on table public.weekly_hours to service_role;
grant select, insert, update, delete on table public.service_shifts to service_role;
grant select, insert, update, delete on table public.special_closures to service_role;
grant select, update, delete on table public.service_capacity to service_role;
grant select, update, delete on table public.reservations to service_role;
grant select, update, delete on table public.table_assignments to service_role;

revoke all on function private.time_to_seconds(time) from public, anon, authenticated, service_role;
revoke all on function private.reservation_holds_capacity(text) from public, anon, authenticated, service_role;
revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function private.has_staff_role(text[]) from public, anon, authenticated, service_role;
revoke all on function private.lock_calendar() from public, anon, authenticated, service_role;
revoke all on function private.lock_tables(uuid[]) from public, anon, authenticated, service_role;
revoke all on function private.assert_slot_open(date, uuid, time) from public, anon, authenticated, service_role;
revoke all on function private.lock_and_recompute_capacity(date, uuid) from public, anon, authenticated, service_role;
revoke all on function private.guard_staff_profile() from public, anon, authenticated, service_role;
revoke all on function private.guard_business_settings() from public, anon, authenticated, service_role;
revoke all on function private.guard_restaurant_table() from public, anon, authenticated, service_role;
revoke all on function private.guard_weekly_hours() from public, anon, authenticated, service_role;
revoke all on function private.guard_service_shift() from public, anon, authenticated, service_role;
revoke all on function private.sync_shift_capacity() from public, anon, authenticated, service_role;
revoke all on function private.guard_special_closure() from public, anon, authenticated, service_role;
revoke all on function private.prepare_reservation() from public, anon, authenticated, service_role;
revoke all on function private.sync_reservation_capacity() from public, anon, authenticated, service_role;
revoke all on function private.release_tables_when_reservation_ends() from public, anon, authenticated, service_role;
revoke all on function private.prepare_table_assignment() from public, anon, authenticated, service_role;
revoke all on function private.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) from public, anon, authenticated, service_role;
revoke all on function private.assign_reservation_tables(uuid, uuid[]) from public, anon, authenticated, service_role;
revoke all on function public.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.assign_reservation_tables(uuid, uuid[]) from public, anon, authenticated, service_role;

-- Returns-trigger functions are not callable from SQL; grant them so staff
-- DML can fire triggers. Void security definer helpers stay service-only.
grant execute on function private.has_staff_role(text[]) to authenticated;
grant execute on function private.set_updated_at() to authenticated, service_role;
grant execute on function private.guard_staff_profile() to authenticated, service_role;
grant execute on function private.guard_business_settings() to authenticated, service_role;
grant execute on function private.guard_restaurant_table() to authenticated, service_role;
grant execute on function private.guard_weekly_hours() to authenticated, service_role;
grant execute on function private.guard_service_shift() to authenticated, service_role;
grant execute on function private.sync_shift_capacity() to authenticated, service_role;
grant execute on function private.guard_special_closure() to authenticated, service_role;
grant execute on function private.prepare_reservation() to authenticated, service_role;
grant execute on function private.sync_reservation_capacity() to authenticated, service_role;
grant execute on function private.release_tables_when_reservation_ends() to authenticated, service_role;
grant execute on function private.prepare_table_assignment() to service_role;
grant execute on function private.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) to service_role;
grant execute on function private.assign_reservation_tables(uuid, uuid[]) to service_role;
grant execute on function public.create_reservation(date, uuid, time, integer, integer, uuid[], text, text, text, text) to service_role;
grant execute on function public.assign_reservation_tables(uuid, uuid[]) to service_role;

comment on table public.business_settings is
  'Single restaurant configuration row. Timezone defaults to Europe/Madrid.';

comment on table public.staff_profiles is
  'Server-written staff roles. Authenticated users cannot insert or change roles.';

comment on table public.guests is
  'Guest display names. Contact details live in guest_contacts.';

comment on table public.guest_contacts is
  'Email and telephone. Visible to owners and managers only.';

comment on table public.restaurant_tables is
  'Dining tables and their floor-plan coordinates.';

comment on table public.weekly_hours is
  'Local opening ranges by ISO weekday. Empty until an owner enters them.';

comment on table public.service_shifts is
  'Bookable services inside weekly hours, with a cover limit.';

comment on table public.special_closures is
  'Date ranges when a shift, or the whole day when shift_id is null, is closed.';

comment on table public.service_capacity is
  'Locked cover counter for one date and shift. Rebuilt from active reservations.';

comment on table public.reservations is
  'Guest reservations. Notes are visible to every active staff role.';

comment on table public.table_assignments is
  'One active assignment per table, service date, and shift.';

comment on function public.create_reservation(
  date, uuid, time, integer, integer, uuid[], text, text, text, text
) is
  'Service-role booking path. Locks the service and tables before inserting.';

comment on function public.assign_reservation_tables(uuid, uuid[]) is
  'Service-role table allocation. Rejects a table that is already held.';

insert into public.business_settings (timezone)
values ('Europe/Madrid');
