# Staging E2E results log

Manual runs of [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md). Append a new section per run; do not store guest PII or secret values here.

## Run 2026-10-27 (local workspace — not executed)

| Field | Value |
|-------|--------|
| Environment | Developer machine (no `.env.local`, no linked staging project in this workspace) |
| Migrations in repo | `20261026184605_restaurant_operations.sql`, `20261027153000_floor_plan_and_table_states.sql`, `20261027170000_fix_capacity_coalesce.sql` |
| Automated substitute | `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build` (see CI) |
| Live staging | **Blocked** — requires approved staging Supabase URL, publishable key, `SUPABASE_SECRET_KEY`, applied migrations, and demo seed |

### Checklist status (manual steps)

| Section | Status | Notes |
|---------|--------|--------|
| 1 Availability lookup | ⏸ Pending | Needs live `GET /api/bookings/availability` |
| 2 Create reservation | ⏸ Pending | Needs `live: true` and seeded shifts/tables |
| 3 Manage-booking lookup | ⏸ Pending | Needs successful book from §2 |
| 4 Cancel + capacity | ⏸ Pending | Depends on §2–3 |
| 5 Staff dashboard | ⏸ Pending | Needs staff Auth + profiles on staging |
| 6 Concurrent / max covers | ⏸ Pending | Live DB only |
| 7 Email / notifications | ⏸ Pending | Expect `readyToSend: false` until Resend ships |
| 8 Cleanup | ⏸ Pending | After a completed run |

### How to record the next run

1. Apply migrations through `20261027170000_fix_capacity_coalesce.sql` on **approved staging**.
2. Run `supabase/seeds/staging_demo_configuration.sql` when guards pass.
3. Configure `.env.local` (never commit).
4. Walk [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md) and copy this section with pass/fail per step.
5. Optional live RPC check: `RUN_LIVE_SUPABASE_TESTS=true npm run test -- lib/booking/booking-rpc-grants.test.ts`.

**Scorecard note:** Booking is still not proven live end-to-end until a row in this file shows §1–4 passed on staging.
