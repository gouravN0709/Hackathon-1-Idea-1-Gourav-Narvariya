-- Fix PostgreSQL type error: COALESCE(bigint, integer) when SUM() returns bigint.
-- Preserves locking, capacity rules, and trigger wiring (functions only; no trigger DDL changes).

create or replace function private.lock_and_recompute_capacity(
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

  select pg_catalog.coalesce(pg_catalog.sum(reservation.party_size), 0::bigint)::integer
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

create or replace function private.sync_reservation_capacity()
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
    ), 0::bigint)::integer < new.party_size then
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

create or replace function private.create_reservation(
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
  ), 0::bigint)::integer < v_party then
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

create or replace function private.assign_reservation_tables(
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
  ), 0::bigint)::integer < v_party then
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
