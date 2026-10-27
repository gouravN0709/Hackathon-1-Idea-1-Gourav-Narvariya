# Staging booking E2E — manual test plan

Run only on an **approved staging** Supabase project with **demo inventory** (`staging_demo_configuration.sql`) until the owner confirms real table labels, seats, and cover limits. Do **not** run against production without explicit approval.

**Preconditions**

- Migrations through `20261027170000_fix_capacity_coalesce.sql` applied on staging (includes operations schema, floor plan, capacity fix).
- Staging demo seed applied (8 tables, 32 seats, 24 max covers, Thu–Sun Lunch active when guards pass).
- `.env.local` on the test machine with publishable URL/key and `SUPABASE_SECRET_KEY` (never commit).
- `GET /api/bookings/status` → `{ "live": true, "reason": null }`.
- `GET /api/health` → `notifications.readyToSend: false` (email must stay off until Resend is implemented and approved).

**Test guest identity (use consistently)**

| Field | Suggested value |
|-------|-----------------|
| Name | `E2E Test Guest` |
| Email | `e2e-staging+YOUR_DATE@example.com` |
| Phone | `+34 600 000 001` (adjust if collision) |
| Notes | `STAGING E2E — safe to cancel` |
| Party | 2 adults, 0 children |
| Date | Next **Thursday–Sunday** with no special closure |
| Arrival | `13:30` (within Lunch window) |

Record the returned reference (`ITU-…`) and `service_date` for every step.

---

## 1. Availability lookup

| Step | Action | Pass criterion |
|------|--------|----------------|
| 1.1 | `GET /api/bookings/availability?date=SERVICE_DATE&arrival=13:30` | `bookable: true` (or equivalent success shape) |
| 1.2 | Pick a **closure date** (add via Staff → Operations or known seed) and repeat | `bookable: false`; guest message has **no** internal closure reason |
| 1.3 | `/book` UI: same open date | Slot shows as available; closed date blocked in UI |

## 2. Create test reservation

| Step | Action | Pass criterion |
|------|--------|----------------|
| 2.1 | Submit booking on `/book` with test guest identity | Success; reference matches `ITU-` prefix |
| 2.2 | `POST /api/bookings` duplicate payload (API or form resubmit) | Second request **409** or unavailable (capacity/tables), not a silent double book |
| 2.3 | Staff → `/staff/reservations` | Reservation visible with correct date, party, status |

## 3. Guest lookup (manage-booking)

| Step | Action | Pass criterion |
|------|--------|----------------|
| 3.1 | `/manage-booking`: reference + email (or phone per UI) | Summary loads; no other guest’s data |
| 3.2 | Wrong email with correct reference | Generic failure; no PII leak |
| 3.3 | Rate limit | After repeated failures, **429** with retry guidance (optional spot-check) |

## 4. Cancellation and capacity release

| Step | Action | Pass criterion |
|------|--------|----------------|
| 4.1 | Cancel eligible reservation on `/manage-booking` | Success message; status cancelled |
| 4.2 | Repeat cancel with same credentials | Idempotent success (already cancelled) |
| 4.3 | `GET /api/bookings/availability` for same date/arrival | Capacity/slot reflects release (bookable again if only that party consumed the slot) |
| 4.4 | Staff reservations list | Status cancelled |

## 5. Staff dashboard visibility

| Step | Action | Pass criterion |
|------|--------|----------------|
| 5.1 | Floor `staff` role | Can view reservation; cannot mutate operations |
| 5.2 | `manager` | Can update reservation status / notes per UI rules |
| 5.3 | `owner` | Operations + timezone editor accessible |

## 6. Duplicate and concurrent behavior

| Step | Action | Pass criterion |
|------|--------|----------------|
| 6.1 | Two browser tabs: same date/party, submit nearly together | At most **one** succeeds; other gets conflict/unavailable |
| 6.2 | Book until `max_covers` (24 demo) exhausted | Further bookings rejected with guest-safe error |

*Automated Vitest covers table selection, readiness, and error mapping; this section requires live DB.*

## 7. Email and notifications

| Step | Action | Pass criterion |
|------|--------|----------------|
| 7.1 | After successful book | UI does **not** promise email delivery |
| 7.2 | `GET /api/health` | `notifications.sendEnabled: false`, `readyToSend: false` |
| 7.3 | Supabase / app logs | No outbound email HTTP calls |

## 8. Cleanup

- Leave cancelled test rows or delete via staff process per farm policy.
- Remove test **special closures** added for 1.2.
- Document reference IDs in your deployment log for audit.

---

Related: [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md), [operations-setup.md](./operations-setup.md) §7.
