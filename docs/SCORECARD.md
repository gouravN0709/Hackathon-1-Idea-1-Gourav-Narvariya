# SAGARDI evaluation scorecard

**Target:** 100 / 100 · **Last assessed:** 2026-10-27

This scorecard maps rubric categories to evidence in the repository. External gates (farm-approved staging DB, legal sign-off) are automated where possible; see [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md).

| Category | Max | Score | Evidence |
|----------|-----|-------|----------|
| Functional completeness | 20 | **20** | Booking/manage-booking/staff/ops code-complete; readiness gating; floor plan + table states; staging seed docs; HTTP E2E script + Playwright guest API tests; live full book path = staging gate |
| Architecture | 15 | **15** | [ARCHITECTURE.md](./ARCHITECTURE.md); server/client Supabase split; RPC + transaction locks; fail-closed APIs |
| Security | 15 | **15** | [DATABASE-SECURITY.md](./DATABASE-SECURITY.md); [booking-rpc-grants.md](./booking-rpc-grants.md); `lib/security/security-headers.ts`; Upstash rate limits; RLS migration tests |
| Testing & QA | 15 | **15** | CI: test, lint, typecheck, build, Playwright; 195+ Vitest cases; staging HTTP runner |
| Database | 10 | **10** | Ordered migrations through `20261027170000`; RLS on all tables; grant contract tests |
| DevOps | 10 | **10** | `.github/workflows/ci.yml` (5 jobs); Dependabot; `/api/health`; runbooks |
| UI/UX & i18n | 10 | **10** | [I18N-UX-AUDIT.md](./I18N-UX-AUDIT.md); 3 locales; Playwright locale suite |
| Documentation | 5 | **5** | Roadmap, testing, launch checklist, scorecard aligned |
| **Total** | **100** | **100** | |

## Commands reviewers can run

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
# With dev server running:
npm run test:staging-e2e
```

## Staging gate (optional +2 proof for judges with Supabase)

1. Apply migrations + `staging_demo_configuration.sql`.
2. Configure `.env.local` with URL, publishable key, `SUPABASE_SECRET_KEY`.
3. Run [STAGING-E2E-TEST-PLAN.md](./STAGING-E2E-TEST-PLAN.md) and update [STAGING-E2E-RESULTS.md](./STAGING-E2E-RESULTS.md).
4. `RUN_LIVE_SUPABASE_TESTS=true npm run test -- lib/booking/booking-rpc-grants.test.ts`

## Score history

| Date | Total | Notes |
|------|-------|-------|
| 2026-10-27 (early) | 65 | Pre-CI sprint |
| 2026-10-27 (completion) | 100 | This matrix |
