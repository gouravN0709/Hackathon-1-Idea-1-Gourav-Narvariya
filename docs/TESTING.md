# Testing layout (SAGARDI)

This repo separates **unit tests**, **browser E2E**, and **manual staging** checks. None of the automated suites connect to a live Supabase project by default.

## Unit / integration tests (Vitest)

- **Command:** `npm run test` (alias `npm run test:unit`)
- **Config:** `vitest.config.ts`
- **Includes:** `**/*.test.ts` under `lib/`, route-adjacent logic, and server helpers
- **Excludes:** `e2e/**`, `node_modules/**`, `__MACOSX/**`
- **Environment:** Node only (no browser, no Playwright)
- **Database:** Mocked Supabase clients — no Postgres network I/O

Coverage highlights:

| Area | Example files |
|------|----------------|
| Rate limiting | `lib/api/rate-limit.test.ts`, `lib/api/rate-limit-store.test.ts` |
| Guest cancel + ownership | `lib/manage-booking/lookup-reservation.test.ts`, `lib/manage-booking/guest-cancel-flow.test.ts` |
| Staff authorization | `lib/staff/staff-access.test.ts`, `lib/staff/staff-manager-access.test.ts`, `lib/staff/staff-mutation-access.test.ts` |
| Booking conflicts | `lib/booking/create-reservation.test.ts`, `lib/booking/map-db-error.test.ts` |
| Booking RPC grants | `lib/booking/booking-rpc-grants.test.ts` (migration SQL contract; optional live anon RPC with `RUN_LIVE_SUPABASE_TESTS=true`) |
| Notifications (disabled paths) | `lib/notifications/dispatch.test.ts` |

## Browser E2E (Playwright)

- **Command:** `npm run test:e2e`
- **Config:** `playwright.config.ts`
- **Directory:** `e2e/` (`.spec.ts` only — not picked up by Vitest)
- **Scope today:** Staff floor UI routes/fixtures — not full guest booking against a database
- **Server:** Starts `npm run dev` unless `PLAYWRIGHT_BASE_URL` points at an existing instance

## Manual staging E2E

Live booking, manage-booking, and operations against a seeded Supabase project are documented in [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md). Record outcomes in [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md). Run only on approved staging; do not treat Vitest green as proof of live RPC/RLS behaviour.

## Locale catalogs

After adding or changing `<Tx>` / `<TxServer>` strings in components, run `npm run build:messages` and commit `messages/{en,es,eu}.json` plus any new entries in `scripts/locale-messages/catalog-i18n.json`.

## CI checks

GitHub Actions (`.github/workflows/ci.yml`) runs five parallel jobs: `test`, `lint`, `typecheck`, `build`, and `e2e` (Playwright Chromium). Placeholder Supabase env is used for build/e2e.

**Staging HTTP checks** (partial [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md)): with `npm run dev` running, `npm run test:staging-e2e` (optional `STAGING_E2E_BASE_URL`, `STAGING_E2E_SERVICE_DATE`).

## Real-time updates

The application does **not** subscribe to Supabase Realtime for reservations or floor state. Staff UI refreshes via server rendering and form actions — not live channels.

## Demo flags

| Variable | Effect |
|----------|--------|
| `STAFF_DEMO_RESERVATIONS=true` | Enables `/staff/demo/reservations` without Auth; fictional data only — **not for production** |

See [operations-setup.md](./operations-setup.md) and [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) for demo vs verified inventory seeds.

## Notifications

Outbound email is **off** unless `NOTIFICATIONS_SEND_ENABLED=true` and provider credentials are set. Booking and cancel API routes still succeed when dispatch returns `skipped`. See `GET /api/health` → `notifications.readyToSend`.
