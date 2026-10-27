# Booking RPC privileges (EXECUTE grants)

Guest booking must never call Postgres reservation writers directly. The application uses the **service role** on the server (`lib/supabase/admin.ts`) and exposes guest flows only through Next.js route handlers.

## Functions

| Function | Schema | Callable by |
|----------|--------|-------------|
| `create_reservation(...)` | `public` | `service_role` only (PostgREST + in-function guard) |
| `assign_reservation_tables(uuid, uuid[])` | `public` | `service_role` only |
| `create_reservation(...)` | `private` | `service_role` only (not exposed via PostgREST) |

Source: `supabase/migrations/20261026184605_restaurant_operations.sql` (privilege block near end of file).

## REVOKE / GRANT pattern

1. **`REVOKE ALL … FROM public, anon, authenticated, service_role`** on both `public` and `private` booking RPCs — clears default grants.
2. **`GRANT EXECUTE … TO service_role`** on `public.create_reservation`, `public.assign_reservation_tables`, and the private helpers the service path needs.

`anon` and `authenticated` never receive `EXECUTE` on these functions. Even if PostgREST exposed the name, `public.create_reservation` raises `42501` when `current_user` is not `service_role`.

## Verification

| Check | How |
|-------|-----|
| Migration contract | `npm run test` → `lib/booking/booking-rpc-grants.test.ts` (reads SQL on disk) |
| Live project | Set `RUN_LIVE_SUPABASE_TESTS=true` with publishable URL/key on a DB that has the migration applied; same test file calls `rpc('create_reservation', …)` as **anon** and expects permission / not-exposed error |

Do not run live tests against production without approval.

## Related

- [operations-setup.md](./operations-setup.md) §4 — guest API routes
- [TESTING.md](./TESTING.md) — CI vs live Supabase tests
