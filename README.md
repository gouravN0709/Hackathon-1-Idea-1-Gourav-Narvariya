# Hackathon App

Minimal Next.js (App Router) starter with TypeScript, Tailwind CSS, and Supabase PostgreSQL.

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

3. Fill in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Find these in the Supabase dashboard under **Project Settings → API**.

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
npx tsc --noEmit
npm run build
```
