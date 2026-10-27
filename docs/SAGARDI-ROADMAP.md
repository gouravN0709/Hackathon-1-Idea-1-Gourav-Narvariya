# SAGARDI master roadmap (Iturrieta Sagardotegia)

Last updated from implementation work in-repo. **No live E2E** against production Supabase unless explicitly recorded in your deployment log.

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
| 2 | Booking + DB | 🟡 | Code path complete; live requires migration + seed + service role |
| 3 | Manage booking | 🟡 | Lookup/cancel wired; no guest date/party edits (by design) |
| 4 | Staff auth + reservations | ✅ | Mutations via server actions + RLS |
| 5 | Restaurant ops DB | ⛔ | Migration in repo; not applied here |
| 6 | Staff operations UI | ✅ | Hours, shifts, closures, tables, owner timezone editor |
| 7 | Closure-aware booking | ✅ | Server pre-check + `/api/bookings/availability`; RPC final |
| 8 | Customer copy alignment | ✅ | Book, FAQ, home CTA use readiness |
| 9 | Runbook + launch checklist | ✅ | `docs/operations-setup.md`, `docs/LAUNCH-CHECKLIST.md` |
| 10 | Notifications | 🟡 | Provider boundary + tests; **no outbound send** until Resend (or other) implemented |
| 11 | Distributed rate limits | 🟡 | In-memory default; `RATE_LIMIT_BACKEND=distributed` falls back until KV/Redis wired |
| 12 | Automated flow tests | 🟡 | Vitest for booking, availability, lookup, cancel, dispatch, rate limits; no live DB E2E |
| 12b | E2E test suite | 📋 | Manual checklist in runbook §7 / LAUNCH-CHECKLIST |
| 13 | Legal / privacy page | 🟡 | Draft at `/legal` with farm facts; binding text needs legal review |

## Completed application work (recent)

- Operations forms: inline server-action errors, preserved create values, pending states, delete/toggle via `useActionState`.
- Owner-only **business timezone** editor (`business_settings.timezone`) with IANA validation.
- Notification **provider boundary** (`lib/notifications/provider.ts`, Resend stub) + dispatch tests.
- Rate-limit **store adapter** (`lib/api/rate-limit-store.ts`) with production limitations documented.
- `/legal` draft using `site-config` contact/address; explicit list of owner/legal gaps.

## Flow audit (application code)

| Flow | Authorization | Validation / concurrency | Gaps |
|------|---------------|---------------------------|------|
| `POST /api/bookings` | Service role server-only | Rate limit, `validateBookingRequest`, readiness, closure pre-check, RPC + DB locks | No live E2E; in-memory rate limit |
| `GET /api/bookings/availability` | Public read | Rate limit, closure + readiness | Same |
| Manage lookup/cancel | Service role | Rate limit, contact match, cancel eligibility, optimistic `updated_at` | No email proof of cancel |
| Staff reservations | Auth + staff profile + RLS | Server actions, status rules | Demo route separate |
| Staff operations | Auth; mutations manager/owner | Overlap/shift preview; owner timezone | Live DB trigger proof manual |
| `/legal` | Public | N/A | Binding policies not published |

## Acceptance criteria (code-complete vs launch)

### Booking live

- [x] App returns 503 when service role missing.
- [x] Readiness and closure checks before RPC.
- [ ] `GET /api/bookings/status` → `live: true` on seeded DB (manual).
- [ ] Successful book returns `ITU-…` reference (manual).

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
- [ ] Distributed rate limiting for multi-instance (shared store not wired).
- [ ] Final legal/privacy text on `/legal`.

## Critical path to live booking

1. ⛔ Approve and apply `20261026184605_restaurant_operations.sql`.
2. ⛔ Seed `business_settings`, `weekly_hours`, `service_shifts`, `restaurant_tables` (farm-confirmed values).
3. ⛔ Set `SUPABASE_SERVICE_ROLE_KEY` on server.
4. ⛔ Create staff Auth user(s) + `staff_profiles`.
5. 🟡 Verify `GET /api/bookings/status` → `live: true`.
6. 📋 Staging manual checklist (`docs/operations-setup.md` §7).

## Remaining blockers (exact)

| Blocker | Owner action |
|---------|----------------|
| Migration not on target DB | Approve SQL apply |
| No operational seed | Run reviewed seed SQL |
| Missing service role in deploy env | Configure secret |
| No staff profiles | Auth user + profile row |
| Email confirmations | Approve provider + finish Resend send |
| Multi-instance rate limit | Implement shared store behind `RATE_LIMIT_BACKEND` |
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
- Wire Redis/KV into `createDistributedRateLimitStore` when infrastructure is chosen.
- Middleware → proxy codemod when upgrading Next.js deploy pipeline.
- Automated E2E against staging Supabase (optional CI job).
