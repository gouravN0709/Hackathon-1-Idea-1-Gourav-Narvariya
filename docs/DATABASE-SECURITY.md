# Database security model

Postgres runs on Supabase with Row Level Security (RLS) on every application table. Privileged writes use narrow grants and server-only RPCs.

## RLS coverage

Verified in CI by `lib/database/rls-migration.test.ts`:

| Table | RLS |
|-------|-----|
| `business_settings`, `staff_profiles` | Staff read; owner/manager mutations per policy |
| `guests`, `guest_contacts` | Staff; contact fields restricted to owner/manager |
| `restaurant_tables`, `weekly_hours`, `service_shifts`, `special_closures` | Staff read; manager write |
| `reservations`, `table_assignments`, `service_capacity` | Staff workflows |
| `restaurant_areas`, `table_service_states` | Floor plan (migration `20261027153000`) |

Policies are defined in migrations — not edited at runtime.

## Booking RPC isolation

| Function | Roles with EXECUTE |
|----------|-------------------|
| `public.create_reservation` | `service_role` only |
| `public.assign_reservation_tables` | `service_role` only |
| `private.create_reservation` | `service_role` only (not PostgREST-exposed) |

Pattern: `REVOKE ALL` from `public`, `anon`, `authenticated`, `service_role`, then `GRANT EXECUTE` to `service_role` only. See [booking-rpc-grants.md](./booking-rpc-grants.md).

## Staff role integrity

`staff_profiles` inserts/updates are guarded by trigger `private.guard_staff_profile()` so authenticated users cannot self-promote to owner.

## Server vs client

- **Staff session:** publishable key + cookies; RLS enforces row access.
- **Guest booking:** Next.js route uses secret key; guests never call RPCs directly.

## Live verification

On an approved staging project:

```bash
RUN_LIVE_SUPABASE_TESTS=true npm run test -- lib/booking/booking-rpc-grants.test.ts
```
