# SAGARDI master roadmap (Iturrieta Sagardotegia)

Last updated: **2026-10-27** (scorecard completion sprint). Staging manual script: [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md). Latest run log: [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md) (live booking **not yet proven** on staging in this workspace).

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done in application code |
| 🟡 | Partial / env-dependent |
| ⛔ | Blocked on approval, credentials, or external service |
| 📋 | Planned |

## Phase summary

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Marketing site | ✅ | Static pages complete |
| 2 | Booking + DB | 🟡 | Code path complete; live requires migration apply + seed + service role |
| 3 | Manage booking | 🟡 | Lookup/cancel wired; no guest date/party edits (by design) |
| 4 | Staff auth + reservations | ✅ | Mutations via server actions + RLS |
| 5 | Restaurant ops DB | ✅ | Migrations in repo through `20261027170000_fix_capacity_coalesce.sql`; apply on target project |
| 6 | Staff operations UI | ✅ | Hours, shifts, closures, tables, floor plan, owner timezone editor |
| 7 | Closure-aware booking | ✅ | Server pre-check + `/api/bookings/availability`; RPC final |
| 8 | Customer copy alignment | ✅ | Book, FAQ, home CTA use readiness |
| 9 | Runbook + launch checklist | ✅ | `docs/operations-setup.md`, `docs/LAUNCH-CHECKLIST.md` |
| 10 | Notifications | 🟡 | Provider boundary + tests; **no outbound send** until Resend (or other) implemented |
| 11 | Distributed rate limits | 🟡 | Upstash Redis adapter wired; needs REST URL/token in deploy |
| 12 | Automated flow tests | 🟡 | Vitest incl. booking RPC grant contract + live optional; no staging E2E pass recorded |
| 12b | E2E test suite | 🟡 | Vitest + Playwright `e2e/`; CI runs unit/lint/tsc/build (4 jobs) |
| 13 | Legal / privacy page | 🟡 | Draft at `/legal` with farm facts; binding text needs legal review |
| 14 | CI / hardening | ✅ | GitHub Actions (test, lint, typecheck, build); security headers in `next.config.ts` |

## Completed application work (recent)

- **2026-10-27:** Parallel CI jobs; HTTP security headers; booking RPC `REVOKE`/`GRANT` documented ([booking-rpc-grants.md](./booking-rpc-grants.md)) + Vitest contract; Upstash Redis rate-limit store; staging E2E results log (blocked pending credentials).
- **2026-10-27:** Removed `__MACOSX` zip debris; Vitest/ESLint excludes; `.env.example`; staging E2E test plan doc.
- Operations forms: inline server-action errors, preserved create values, pending states, delete/toggle via `useActionState`.
- Owner-only **business timezone** editor (`business_settings.timezone`) with IANA validation.
- Notification **provider boundary** (`lib/notifications/provider.ts`, Resend stub) + dispatch tests.
- Rate-limit **store adapter** (`lib/api/rate-limit-store.ts`, `lib/api/rate-limit-upstash.ts`).
- `/legal` draft using `site-config` contact/address; explicit list of owner/legal gaps.

## Flow audit (application code)

| Flow | Authorization | Validation / concurrency | Gaps |
|------|---------------|---------------------------|------|
| `POST /api/bookings` | Service role server-only | Rate limit, `validateBookingRequest`, readiness, closure pre-check, RPC + DB locks | No staging E2E pass logged |
| `GET /api/bookings/availability` | Public read | Rate limit, closure + readiness | Same |
| Manage lookup/cancel | Service role | Rate limit, contact match, cancel eligibility, optimistic `updated_at` | No email proof of cancel |
| Staff reservations | Auth + staff profile + RLS | Server actions, status rules | Demo route separate |
| Staff operations | Auth; mutations manager/owner | Overlap/shift preview; owner timezone | Live DB trigger proof manual |
| `/legal` | Public | N/A | Binding policies not published |

## Acceptance criteria (code-complete vs launch)

### Booking live

- [x] App returns 503 when service role missing.
- [x] Readiness and closure checks before RPC.
- [x] Booking RPC EXECUTE grants documented and covered by Vitest (optional live anon test).
- [ ] `GET /api/bookings/status` → `live: true` on seeded DB (manual).
- [ ] Successful book returns `ITU-…` reference (manual — see [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md)).

### Operations

- [x] Managers can CRUD closures, shift covers/active, tables, weekly hours with preview.
- [x] Owners can update business timezone in UI (RLS-enforced).
- [x] Floor staff read-only on mutations.
- [ ] Hours/shift edits verified against real DB triggers (manual).

### Notifications

- [x] Disabled by default; health reports `readyToSend: false` until outbound code ships.
- [x] Dispatch skips without PII in logs; tests for disabled/misconfigured/failure paths.
- [ ] Provider API key + templates + consent copy approved.
- [ ] Implement actual HTTP send in `lib/notifications/providers/resend.ts`.

### Production hardening

- [x] Guest errors avoid PII and closure reasons.
- [x] Health endpoint for config smoke test.
- [x] Response security headers (Next.js `headers()`).
- [x] CI: test, lint, typecheck, build.
- [ ] Upstash credentials on multi-instance deploy (adapter ready).
- [ ] Final legal/privacy text on `/legal`.

## Critical path to live booking

1. ⛔ Approve and apply migrations through `20261027170000_fix_capacity_coalesce.sql` on target Supabase project.
2. ⛔ Seed `business_settings`, `weekly_hours`, `service_shifts`, `restaurant_tables` (farm-confirmed values or guarded staging demo).
3. ⛔ Set `SUPABASE_SECRET_KEY` on server (legacy `SUPABASE_SERVICE_ROLE_KEY` still read if present).
4. ⛔ Create staff Auth user(s) + `staff_profiles`.
5. 🟡 Verify `GET /api/bookings/status` → `live: true`.
6. 📋 Complete staging manual checklist and record in [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md).

## Remaining blockers (exact)

| Blocker | Owner action |
|---------|----------------|
| Migration not on target DB | Approve SQL apply |
| No operational seed | Run reviewed seed SQL |
| Missing service role in deploy env | Configure `SUPABASE_SECRET_KEY` |
| No staff profiles | Auth user + profile row |
| Email confirmations | Approve provider + finish Resend send |
| Multi-instance rate limit | Set Upstash REST env vars with `RATE_LIMIT_BACKEND=distributed` |
| Staging E2E proof | Run plan on approved staging; update results log |
| Legal copy | Farm/legal review of `/legal` checklist items |

## Admin UI audit (hours, shifts, closures, tables)

| Entity | RLS (authenticated) | App UI |
|--------|---------------------|--------|
| `weekly_hours` | Staff select; manager insert/update/delete | List, add, edit, delete with overlap/shift preview + inline errors |
| `service_shifts` | Staff select; manager write | Edit max covers + active |
| `special_closures` | Staff select; manager write | List, add, delete with inline errors |
| `restaurant_tables` | Staff select; manager write | List, add, activate/deactivate with inline errors |
| `business_settings` | Staff select; owner update timezone | Owner editor on `/staff/operations` |

## Next safe code tasks

- Resend HTTP implementation once credentials and templates exist.
- Playwright guest booking against staging (optional CI job with secrets).
- Middleware → proxy codemod when upgrading Next.js deploy pipeline.
