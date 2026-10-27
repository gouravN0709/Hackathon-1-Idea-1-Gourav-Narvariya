-- Phase 2: restaurant areas, floor-plan fields, and per-service table operational status.
-- Review only. Do not apply until accepted alongside the base operations migration.

set search_path = public, extensions, pg_catalog;

create table public.restaurant_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  canvas_width numeric(8, 2) not null default 1200,
  canvas_height numeric(8, 2) not null default 800,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_areas_name_length
    check (char_length(btrim(name)) between 1 and 40),
  constraint restaurant_areas_sort_order_nonnegative
    check (sort_order >= 0),
  constraint restaurant_areas_canvas_positive
    check (canvas_width > 0 and canvas_height > 0)
);

create unique index restaurant_areas_name_lower_idx
  on public.restaurant_areas (lower(btrim(name)));

alter table public.restaurant_tables
  add column area_id uuid,
  add constraint restaurant_tables_area_id_fkey
    foreign key (area_id) references public.restaurant_areas (id) on delete set null;

create index restaurant_tables_area_id_idx
  on public.restaurant_tables (area_id);

create table public.table_service_states (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null,
  service_date date not null,
  shift_id uuid not null,
  operational_status text not null default 'available',
  updated_at timestamptz not null default now(),
  constraint table_service_states_table_id_fkey
    foreign key (table_id) references public.restaurant_tables (id) on delete cascade,
  constraint table_service_states_shift_id_fkey
    foreign key (shift_id) references public.service_shifts (id) on delete restrict,
  constraint table_service_states_status_check check (
    operational_status in (
      'available',
      'reserved',
      'arrived',
      'occupied',
      'cleaning',
      'blocked'
    )
  ),
  constraint table_service_states_service_key unique (table_id, service_date, shift_id)
);

create index table_service_states_service_idx
  on public.table_service_states (service_date, shift_id);

create trigger restaurant_areas_set_updated_at
  before update on public.restaurant_areas
  for each row execute function private.set_updated_at();

create trigger table_service_states_set_updated_at
  before update on public.table_service_states
  for each row execute function private.set_updated_at();

create function private.sync_table_states_on_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.released_at is null then
    insert into public.table_service_states (
      table_id,
      service_date,
      shift_id,
      operational_status
    )
    values (new.table_id, new.service_date, new.shift_id, 'reserved')
    on conflict (table_id, service_date, shift_id)
    do update set
      operational_status = case
        when public.table_service_states.operational_status in ('blocked', 'cleaning')
          then public.table_service_states.operational_status
        else 'reserved'
      end,
      updated_at = pg_catalog.now();
  end if;

  if tg_op = 'UPDATE' and old.released_at is null and new.released_at is not null then
    insert into public.table_service_states (
      table_id,
      service_date,
      shift_id,
      operational_status
    )
    values (new.table_id, new.service_date, new.shift_id, 'available')
    on conflict (table_id, service_date, shift_id)
    do update set
      operational_status = case
        when public.table_service_states.operational_status = 'occupied'
          then 'cleaning'
        when public.table_service_states.operational_status in ('reserved', 'arrived')
          then 'available'
        else public.table_service_states.operational_status
      end,
      updated_at = pg_catalog.now();
  end if;

  return new;
end;
$$;

create trigger table_assignments_sync_table_states
  after insert or update on public.table_assignments
  for each row execute function private.sync_table_states_on_assignment();

alter table public.restaurant_areas enable row level security;
alter table public.table_service_states enable row level security;

create policy restaurant_areas_staff_select
  on public.restaurant_areas
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy restaurant_areas_manager_insert
  on public.restaurant_areas
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy restaurant_areas_manager_update
  on public.restaurant_areas
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])))
  with check ((select private.has_staff_role(array['owner', 'manager'])));

create policy restaurant_areas_manager_delete
  on public.restaurant_areas
  for delete
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager'])));

create policy table_service_states_staff_select
  on public.table_service_states
  for select
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy table_service_states_staff_insert
  on public.table_service_states
  for insert
  to authenticated
  with check ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

create policy table_service_states_staff_update
  on public.table_service_states
  for update
  to authenticated
  using ((select private.has_staff_role(array['owner', 'manager', 'staff'])))
  with check ((select private.has_staff_role(array['owner', 'manager', 'staff'])));

revoke all on table public.restaurant_areas from public, anon, authenticated, service_role;
revoke all on table public.table_service_states from public, anon, authenticated, service_role;

grant select, insert, delete on table public.restaurant_areas to authenticated;
grant update (name, sort_order, canvas_width, canvas_height, updated_at)
  on table public.restaurant_areas to authenticated;

grant select, insert on table public.table_service_states to authenticated;
grant update (operational_status, updated_at)
  on table public.table_service_states to authenticated;

grant update (area_id, updated_at) on table public.restaurant_tables to authenticated;

grant select, insert, update, delete on table public.restaurant_areas to service_role;
grant select, insert, update, delete on table public.table_service_states to service_role;

revoke all on function private.sync_table_states_on_assignment() from public, anon, authenticated, service_role;
grant execute on function private.sync_table_states_on_assignment() to service_role;

comment on table public.restaurant_areas is
  'Named dining areas for the visual floor plan.';

comment on table public.table_service_states is
  'Physical table status for one service. Separate from reservation lifecycle.';
