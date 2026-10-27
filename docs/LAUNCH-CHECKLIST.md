# Launch checklist — Iturrieta Sagardotegia (SAGARDI)

Use this list before turning on public online booking. It separates **verified restaurant settings** (you confirm with the farm) from **demo/placeholder data** (safe for development only).

Related docs: [operations-setup.md](./operations-setup.md), [SAGARDI-ROADMAP.md](./SAGARDI-ROADMAP.md).

## Deploy safely while booking is off

You can deploy to production with credentials set and **`GET /api/bookings/status` → `live: false`**. In that mode:

| Surface | Behavior |
|---------|----------|
| `/book` | Preview copy; form does not persist reservations when not live |
| `POST /api/bookings` | Returns **503** (`configuration`) when readiness is not live |
| `GET /api/bookings/availability` | Returns `bookable: false` with readiness reason |
| Manage-booking APIs | Work only when server secret is configured; no PII in generic errors |
| `/staff/*` | Auth + RLS; middleware refreshes session only on staff routes |
| `GET /api/health` | Config smoke test only (no DB ping, no secret values) |

**Required production env (names only):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (server-only; never `NEXT_PUBLIC_`)

**Optional (leave unset until approved):**

- `NOTIFICATIONS_*` — sending stays off; health reports `readyToSend: false`
- `RATE_LIMIT_BACKEND=distributed` — falls back to in-memory until a shared store is wired
- `STAFF_DEMO_RESERVATIONS=true` — **do not enable in production**

After deploy, verify:

```bash
curl -s https://YOUR_HOST/api/health | jq .
curl -s https://YOUR_HOST/api/bookings/status | jq .
```

Expect `booking` readiness false until operational data and active shifts are approved.

---

## Demo vs verified data

| Item | Demo / placeholder (replace before launch) | Verified when… |
|------|---------------------------------------------|----------------|
| `restaurant_tables` | **DEMO / STAGING:** `Table 1`–`Table 8`, 32 seats via `staging_demo_configuration.sql` (fictitious positions) | Owner confirms real labels, seats, active flags, floor positions |
| `service_shifts.max_covers` | **DEMO / STAGING:** 24 on Thu–Sun Lunch after staging seed | Each active shift ≤ total active seats; reflects real cover policy |
| `service_shifts.is_active` | **DEMO / STAGING:** activated only by staging seed guards on hackathon DB | Owner explicitly activates Thu–Sun shifts after limits are set on production |
| `service_shifts.name` / times | Generic “Lunch” 13:00–16:00 | Match actual service (UI can toggle active/covers; times need SQL if different) |
| `weekly_hours` | Thu–Sun 13:00–16:00 seed | Matches real opening hours in Operations or SQL |
| `business_settings.timezone` | Expected `Europe/Madrid` | Owner confirms in Operations |
| `special_closures` | Empty until farm adds dates | Owner/manager adds real closure dates |
| `lib/site-config.ts` | Marketing copy, display prices | Legal/marketing review; not the booking capacity source |
| Notifications | Stub provider, no HTTP send | Resend (or other) key, templates, consent, `readyToSend` implementation |

---

## Technical pre-launch (Cursor / CI)

- [ ] `npm run test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` pass on release commit
- [ ] Migration applied on target Supabase project (reviewed, not reset)
- [ ] RLS and staff bootstrap verified (owner can sign in; `/staff/operations` loads)
- [ ] `GET /api/health` → publishable + secret configured; `rateLimit.mode` understood for your host
- [ ] `GET /api/bookings/status` → `live: true` only after **your explicit go-live approval**
- [ ] Operations **Online booking readiness** checklist all green (or acknowledged warnings)
- [ ] Distributed rate limiting planned if running **multiple instances** (otherwise limits are per process)

---

## Business / owner decisions (not automated)

- [ ] Real table inventory and seating capacity
- [ ] Per-day (Thu–Sun) cover limits and when to activate shifts
- [ ] Closure calendar (whole farm or per shift)
- [ ] Guest cancellation policy alignment with `/legal` and staff training
- [ ] Email/SMS: provider, API key, templates, GDPR/consent copy
- [ ] Legal/privacy text on `/legal` reviewed by counsel
- [ ] Payment: remains out of scope until explicitly scoped

---

## Go-live sequence (after decisions above)

1. In **Staff → Operations**, replace demo tables and set **max covers** on each shift (≤ active seats).
2. Confirm **weekly hours** and **timezone** still match service dates.
3. Add any **special closures** for known closed dates.
4. When ready, **activate** Thu–Sun shifts (one day at a time is fine).
5. Confirm `GET /api/bookings/status` → `{ "live": true, "reason": null }`.
6. One test booking on `/book` in staging; lookup and eligible cancel on `/manage-booking`.
7. Staff confirms reservation appears on `/staff/reservations`.

Do **not** skip step 5. The app intentionally blocks `POST /api/bookings` until readiness is live.

---

## Post-launch monitoring

- Watch Supabase logs for RPC/RLS errors on `create_reservation`
- Rate-limit abuse: consider shared store before high traffic
- Keep guest-facing errors generic (no closure reasons or guest PII in API responses)
