# Iturrieta Sagardotegia — operational setup and deployment

This runbook describes how to prepare the reservation database, verify booking readiness, deploy the Next.js app, and operate staff tools. It does **not** replace farm-specific business decisions (hours, capacity, legal text).

## Prerequisites

- Node.js 20.19+ (or 22.13+)
- A Supabase project (Auth + Postgres)
- Secrets in `.env.local` (never commit). Next.js also reads `.env`, but **`.env.local` is the supported local file** and overrides `.env` when both exist.

  | Variable | Where used |
  |----------|------------|
  | `NEXT_PUBLIC_SUPABASE_URL` | Browser + server |
  | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server session |
  | `SUPABASE_SECRET_KEY` | Server only: guest booking, manage-booking, readiness (Supabase **secret** key; never `NEXT_PUBLIC_`) |

Copy `.env.example` to `.env.local` and replace placeholders from **Supabase Dashboard → Project Settings → API** (Project URL, publishable key, **secret** key for server-side use). Do not commit `.env` or `.env.local`. The secret key must stay on the server—Route Handlers, Server Actions, and local scripts only—not in the browser bundle.

Optional:

- `STAFF_DEMO_RESERVATIONS=true` — local-only fictional staff list at `/staff/demo/reservations` (not for production).

## 0. Local environment and verification (SAGARDI)

Use this sequence after the migration is already recorded on the project (for example `eearnmyjthaboddgcrxm`).

### 0.1 Configure environment variables

1. Create `.env.local` from `.env.example` if it does not exist.
2. Set all three required variables (names only — never paste keys into chat or commits):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
3. If you previously used a root `.env` file, migrate values into `.env.local` and rely on one canonical file. If you still have the legacy `SUPABASE_SERVICE_ROLE_KEY` name from older docs, rename it to `SUPABASE_SECRET_KEY` (same Dashboard value). The app treats missing **either** the publishable URL/key pair **or** the secret key as “not configured” for the affected routes.

### 0.2 Restart the dev server

Environment variables load at process start. After any change:

```bash
# stop the running dev server (Ctrl+C), then:
npm run dev
```

### 0.3 Create the initial Supabase Auth user (manual)

In **Supabase Dashboard → Authentication → Users → Add user**, create the first owner’s email/password (or invite flow). Confirm the user appears in the list. **The app does not create Auth users for you.**

Copy the user’s **UUID** from the user detail panel; you will need it for SQL bootstrap or the local script below.

### 0.4 Assign the owner `staff_profiles` row (manual, elevated role)

`staff_profiles` rows **cannot** be inserted by signed-in staff or the browser. The migration trigger `private.guard_staff_profile` allows changes only when the database role is `service_role`, `postgres`, or Supabase admin roles.

Choose **one** approved method:

**Option A — SQL template (Dashboard SQL Editor as `postgres`)**

1. Open `supabase/seeds/bootstrap_staff_owner.template.sql`.
2. Replace `CONFIRM_AUTH_USER_UUID` and `CONFIRM_OWNER_DISPLAY_NAME`.
3. Run the script in the SQL Editor.
4. Run the verification `SELECT` at the bottom of that file.

**Option B — Local bootstrap script (secret key from `.env.local` only)**

Runs on your machine; uses `SUPABASE_SECRET_KEY` from env; does **not** expose the key in the repo or HTTP API.

```bash
node scripts/bootstrap-staff-owner.mjs \
  --email "owner@your-domain.example" \
  --display-name "Owner Display Name" \
  --role owner
```

Alternatively pass `--user-id <uuid>` instead of `--email`. The script refuses to overwrite an existing profile for the same user.

### 0.5 Verify staff sign-in and owner access

1. Open `/staff/login` and sign in with the Auth user from step 0.3.
2. Confirm `/staff/reservations` loads (any active `owner`, `manager`, or `staff` role).
3. Confirm `/staff/operations` loads; only **owners** may change `business_settings.timezone` (managers can view and edit shifts, tables, hours, closures).

If sign-in works but pages show “no staff profile”, the `staff_profiles` insert did not succeed or `is_active` is false.

### 0.6 Check health and booking readiness

With the dev server running:

| Check | Expected when configured |
|-------|---------------------------|
| `GET /api/health` | `supabase.publishableConfigured: true`, `supabase.serviceRoleConfigured: true` |
| `GET /api/bookings/status` | See §0.7 — `live: true` only when DB **and** operational data satisfy readiness |

Example:

```bash
curl -s http://localhost:3000/api/health | jq .
curl -s http://localhost:3000/api/bookings/status | jq .
```

### 0.7 Remaining blockers before public booking (`/api/bookings/status`)

After credentials are set, `assessBookingReadiness` in `lib/booking/readiness.ts` can still return `live: false` for these reasons (exact `reason` strings):

| Reason | Meaning |
|--------|---------|
| `Server booking credentials are not configured.` | Missing `NEXT_PUBLIC_SUPABASE_URL` and/or `SUPABASE_SECRET_KEY` |
| `Could not reach the reservation database.` | Admin client failed (network, wrong URL/key, project paused) |
| `The reservation database migration has not been applied.` | Core tables missing |
| `Could not verify business settings.` | Query error on `business_settings` |
| `Business settings are missing from the database.` | No timezone row |
| `Could not read weekly operating hours.` | Query error on `weekly_hours` |
| `Weekly hours for cellar service days are not configured in the database.` | Thu–Sun rows must cover 13:00–16:00 (`Europe/Madrid` service window in code) |
| `Could not read service shifts.` | Query error on `service_shifts` |
| `Active service shifts for cellar days are not configured in the database.` | Each Thu–Sun needs an **active** shift covering 13:00–16:00 |
| `Could not read restaurant tables.` | Query error on `restaurant_tables` |
| `No active table seating is configured...` | No active tables or zero total seats |
| `Active service shifts allow more covers than active table seating (...)` | Sum of active `seat_count` must be ≥ each active shift’s `max_covers` on bookable days |

**DEMO / STAGING on SAGARDI (hackathon project `eearnmyjthaboddgcrxm`; not production floor data):**

Apply after demo table seed:

```bash
# Supabase SQL Editor (postgres) or CLI — file is idempotent for Table 1–8 layout
# supabase/seeds/staging_demo_configuration.sql
```

| Setting | Staging demo value |
|---------|-------------------|
| **Timezone** | `Europe/Madrid` (unchanged) |
| **Weekly hours** | Thu–Sun 13:00–16:00 (unchanged) |
| **Tables** | `Table 1`–`Table 8`, sort_order 1–8, **32 seats** (four 2-seat + four 6-seat); floor coordinates unchanged |
| **Lunch shifts** | Thu–Sun 13:00–16:00, **max_covers = 24**, **is_active = true** only when the seed’s guards pass (exactly 8 tables, 4 shifts, 0 reservations, Madrid timezone) |

Staff **Operations** shows a **DEMO / STAGING** banner when this inventory is detected. Replace with farm-confirmed values before production go-live (see [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)).

Until `live: true`, `/book` remains preview mode (no persisted reservations). Notifications remain off regardless (`GET /api/health` → `notifications.readyToSend: false`).

## 1. Apply the database migration

1. Review `supabase/migrations/20261026184605_restaurant_operations.sql` (schema, RLS, RPCs, triggers).
2. Apply it to the target project using Supabase CLI or SQL editor **after explicit approval** for that environment.
3. Do not reset production data to “make migrations fit.”

## 2. Seed operational data

Use templates as checklists; confirm every value with the farm before running SQL.

| File | Purpose |
|------|---------|
| `supabase/seeds/operational_data.template.sql` | `business_settings`, `weekly_hours`, `service_shifts` |
| `supabase/seeds/restaurant_tables.template.sql` | Table inventory (constraints + verification queries) |
| `supabase/seeds/restaurant_tables.demo.sql` | **Development-only** demo floor plan |
| `supabase/seeds/staging_demo_configuration.sql` | **DEMO / STAGING** relabel, seat counts, Lunch max_covers, guarded shift activation |

After seeding:

1. `GET /api/health` — `supabase.publishableConfigured` and `supabase.serviceRoleConfigured` should be `true` in the deployment environment.
2. `GET /api/bookings/status` — expect `{ "live": true, "reason": null }` when hours, active shifts (Thu–Sun covering 13:00–16:00), tables, and capacity alignment are satisfied.

Until status is live, `/book` stays in preview mode (no real submissions).

## 3. Staff access

1. Create a Supabase Auth user (email/password) for each staff member.
2. Insert a row into `public.staff_profiles` with `user_id`, `role` (`owner` | `manager` | `staff`), `display_name`, and `is_active = true`. This insert requires elevated DB role (see migration `guard_staff_profile`). For the **first owner**, use §0.4 (`bootstrap_staff_owner.template.sql` or `scripts/bootstrap-staff-owner.mjs`).
3. Sign in at `/staff/login`.
4. **Reservations** — all active staff roles.
5. **Operations** (`/staff/operations`) — all active staff can view; owners and managers mutate shifts, closures, tables, and weekly hours; **owners only** may change `business_settings.timezone` (UI + RLS).

## 4. Guest booking and manage-booking

| Route | Role |
|-------|------|
| `POST /api/bookings` | Creates reservation via RPC (service role); rate-limited |
| `GET /api/bookings/status` | Public readiness |
| `GET /api/bookings/availability?date=&arrival=` | Slot check including special closures (service role) |
| `POST /api/manage-booking/lookup` | Guest lookup (rate-limited) |
| `POST /api/manage-booking/cancel` | Guest cancel (rate-limited) |

Special closures in the database block booking for matching dates (whole farm or one shift). The app pre-checks closures; the RPC remains authoritative.

## 5. Production build and deploy

```bash
npm ci
npm run test
npm run lint
npx tsc --noEmit
npm run build
npm start
```

Deploy to your host (Vercel, etc.) with the same env vars. Use `GET /api/health` for a lightweight config check (no DB ping). The response includes `booking.serverCredentialsConfigured`, `rateLimit` (memory vs distributed fallback), and notification flags—never secret values.

**Booking disabled deploy:** Production is safe while `GET /api/bookings/status` returns `live: false`; guest POSTs are rejected with 503 until readiness passes. See **[LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)** for demo vs verified data and the full go-live sequence.

**Rate limiting** uses `lib/api/rate-limit-store.ts`. The default is an in-memory counter **per Node process** (limits do not aggregate across instances; counters reset on cold starts). `RATE_LIMIT_BACKEND=distributed` is reserved for a future shared store—until Redis/KV is implemented, the app **falls back** to in-memory and distributed protection is **not** active. Plan a shared backend before high-traffic multi-instance launch.

**Middleware:** Next.js 16 may deprecate `middleware.ts` in favor of `proxy` — run the codemod when upgrading.

## 6. Notifications and integrations

Email hooks exist in `lib/notifications/` (`dispatch.ts` → `provider.ts` → `providers/resend.ts`) but **do not perform HTTP sends** until the Resend adapter is completed and reviewed. Env vars alone are not enough: `GET /api/health` → `notifications.readyToSend` stays `false` until outbound code is implemented. SMS, WhatsApp, and payments remain disabled. Success screens tell guests to keep their reference; do not claim email delivery until integrated.

## 7. Manual verification checklist (staging)

After migration + seed + env (not automated in CI here):

- [ ] `/api/bookings/status` → live
- [ ] Create booking on `/book` → receive `ITU-…` reference
- [ ] `/manage-booking` lookup + eligible cancel
- [ ] Staff login → reservations list + mutation
- [ ] Manager → add/remove closure, adjust shift covers, toggle table, edit weekly hours
- [ ] Owner → update business timezone; verify booking dates still align with `Europe/Madrid` (or chosen zone)
- [ ] Closure date rejected on book form and API

## 8. Security reminders

- Never expose `SUPABASE_SECRET_KEY` to the client (no `NEXT_PUBLIC_` prefix), logs, API responses, or git commits.
- Guest-facing errors must not include closure `reason` text or guest PII.
- RLS and triggers in the migration are the source of truth; do not bypass with permissive policies.
