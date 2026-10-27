<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Iturrieta Sagardotegia

Project instructions for this repository. Leave the marked Next.js block above unchanged, including its wording and markers. `next dev` rewrites that block in place and preserves everything after it.

Iturrieta Sagardotegia is a family-run Basque cider house and restaurant at Caserío Goikola in Aramaio, Spain. This repository is the public website. The long-term product is a secure restaurant management platform with reservations, floor plans, shifts, staff permissions, and owner reporting. Build only the piece the current task asks for.

Where these instructions are stricter than `.agents/skills/supabase/SKILL.md` or `.agents/skills/supabase-postgres-best-practices/SKILL.md`, follow this file. Use those skills for Supabase and Postgres work, and read the Next.js docs named in the block above before using framework APIs.

## Architecture

- Next.js 16 App Router, React 19, TypeScript in `strict` mode, and Tailwind CSS 4. There is no Pages Router and no separate API server.
- Routes live in `app/`. UI lives in `components/`, grouped by surface: `home`, `book`, `menu`, `our-farm`, `visit`, `faq`, `manage-booking`, `layout`, and `ui`.
- Import project files with the `@/*` path alias.
- Public business copy, contact details, dining hours, txotx season, and menu prices live in `lib/site-config.ts`. That file is the current configuration. Do not invent replacements or overwrite it with sample data.
- `lib/sample-booking.ts` is fictional preview data for the manage-booking prototype. Keep it labeled as sample data.
- `lib/service-calendar.ts` validates the booking prototype in the runtime's local calendar. Leave it alone unless the task is about dates or service hours.
- Supabase browser and server clients stay separate:
  - Browser and Client Components: `lib/supabase/client.ts` (`createBrowserClient`, publishable key only).
  - Server Components, Route Handlers, and Server Actions: `lib/supabase/server.ts` (`createServerClient`, cookie session). The server helper is async.
- Do not import `lib/supabase/server.ts` into a file that starts with `"use client"`.
- No database schema, `supabase/migrations/` directory, or test script exists yet. Add them only when the task asks for them.

```ts
import { createClient } from "@/lib/supabase/client"; // browser
import { createClient } from "@/lib/supabase/server"; // server only
```

## Completed customer pages

These surfaces are finished. Do not redesign, restyle, or rewrite them while doing other work:

- `/` (`app/page.tsx` and `components/home/`)
- `/our-farm`, `/menu`, `/visit`, `/faq`, `/legal`
- `/book` and `/manage-booking` (browser previews; they do not save a reservation)
- `app/not-found.tsx`
- `app/api/health/route.ts`

Change one of these only when the task names that page or a defect in it. Keep the diff as small as the defect requires. Booking and manage-booking must keep stating that they are previews until a tested reservation backend exists.

## Environment and secrets

- Local secrets belong in `.env.local`. Git ignores `.env` and `.env.*` except `.env.example` and `.env.*.example`.
- `.env.example` contains placeholders only. Never commit real keys, database passwords, or connection strings.
- Browser code may receive only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- A service-role key, secret API key, or database password is server-only. Never give it a `NEXT_PUBLIC_` name, and never put it in client code, logs, commits, or responses.
- Read a required variable, trim it, and fail with a message that names the variable but not its value. Do not print env values while debugging.
- Server booking and manage-booking use `SUPABASE_SECRET_KEY` (Dashboard secret key; never `NEXT_PUBLIC_`). Legacy `SUPABASE_SERVICE_ROLE_KEY` is read only when the canonical name is unset. Document placeholders in `.env.example` as `YOUR_SECRET_KEY`, not publishable keys.

## Data and integrations

- Use the existing sample booking and in-browser validation during development.
- Payment, email, WhatsApp, voice-agent, and any other external integration stay disabled until credentials, consent requirements, and tests are in place. A missing credential is not a reason to call the service with a sample key.
- Do not connect this app to a live Supabase project, apply SQL, or enable an integration unless the task explicitly asks for that step.

## Database and access control

When a task adds schema, propose the change and wait for approval before running it on a live database. Explain the tables, RLS policies, migration steps, and what the policies do not protect. Then apply the migration.

- Put each schema change in a new versioned SQL file under `supabase/migrations/`. Do not reset, drop, or rewrite existing production data to make a migration fit.
- Enable RLS on every table that stores application data, in every exposed schema. A policy of `using (true)` for `anon` or `authenticated` is not acceptable as a shortcut.
- Grant the narrowest table, column, and function privileges that the feature needs. Enabling RLS does not replace a missing `GRANT`, and a `GRANT` does not replace RLS.
- Authorize on the server and again in RLS. Staff and owner actions require a role stored in `app_metadata` or a server-written staff table. Do not read roles from `user_metadata`; guests can edit that field. A user must not be able to grant themselves a higher role.
- `TO authenticated` only proves the caller is signed in. Pair it with an ownership or staff predicate, and give `UPDATE` policies both `USING` and `WITH CHECK`.
- Views in exposed schemas need `security_invoker = true`. Do not add `SECURITY DEFINER` to get past a permission error. Prefer `SECURITY INVOKER`.
- Treat client input as untrusted. Recompute price, role, booking status, table availability, and permissions on the server. Validate shape and bounds before use. Menu amounts in `lib/site-config.ts` are display defaults, not a price the browser may set.
- Create reservations and allocate tables so two concurrent requests cannot exceed capacity. Do that inside one database transaction, with a constraint or `SELECT ... FOR UPDATE` on the capacity being claimed. A check in the browser or a read-then-insert in application code is not enough.
- Store instants as `timestamptz` in UTC. Interpret service dates and opening hours in `Europe/Madrid` until a stored business setting names another timezone. Keep that timezone in one configurable place.
- Return safe errors. Logs and client responses must not include guest names, contact details, notes, or other private reservation data.
- The service-role key bypasses RLS. Use it only in a reviewed server path, never as the default client.

## Working on a task

Before editing:

1. Read the files the change will touch and match their names, structure, and styling.
2. Summarize the relevant architecture and the smallest change that satisfies the request.
3. Implement only that task. Do not refactor unrelated files or rewrite a completed page.

Ask before any of these:

- Destructive git commands, or resetting, dropping, or altering existing production data
- Applying a migration to a live database
- Enabling payment, email, WhatsApp, voice, or another external service
- Changing established business behavior: hours, prices, capacity, contact details, or guest-facing policies

After the change, report the files changed, the checks below and their real results, outstanding issues, and any manual steps.

## Checks

This repository has no test script. After a code change, run the checks that apply and report each command's result. Do not claim a check passed unless it finished successfully. If a check cannot run, say why.

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

A documentation-only edit does not need these commands. A database change still needs the schema, RLS, migration, and security explanation before it is applied anywhere live.
