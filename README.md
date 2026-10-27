# Iturrieta Sagardotegia — public website

Next.js (App Router) site with TypeScript, Tailwind CSS, guest booking APIs, manage-booking, and staff operations backed by Supabase PostgreSQL.

## Prerequisites

- Node.js 20.19+ (or 22.13+)
- A [Supabase](https://supabase.com) project

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and add your Supabase values:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` (see `.env.example`):

   - `NEXT_PUBLIC_SUPABASE_URL` — project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — **anon / publishable** key (safe in the browser)
   - `SUPABASE_SECRET_KEY` — **secret** key (server-only; same Dashboard page, never `NEXT_PUBLIC_`). Required for live booking, availability, and manage-booking APIs. Legacy deploys may still set `SUPABASE_SERVICE_ROLE_KEY`; the app reads it only when the canonical name is unset.

   Supabase **Project Settings → API** lists URL, publishable key, and secret key.

   Optional for multi-instance rate limits: `RATE_LIMIT_BACKEND=distributed`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## Run

Development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health).

Production:

```bash
npm run build
npm start
```

## Project notes

- Frontend and API routes both live in this Next.js app (no separate Express server).
- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts`
- `.env.local` is ignored by Git. Commit `.env.example` only.
- **Operational setup, deployment, and roadmap:** see [docs/operations-setup.md](docs/operations-setup.md) and [docs/SAGARDI-ROADMAP.md](docs/SAGARDI-ROADMAP.md).

## Checks

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs the same four commands in parallel on push/PR (`.github/workflows/ci.yml`).

Unit vs browser E2E vs manual staging: [docs/TESTING.md](docs/TESTING.md). Database migrations live under `supabase/migrations/` (apply on your Supabase project before expecting `GET /api/bookings/status` → `live: true`).
