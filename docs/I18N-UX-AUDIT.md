# UI/UX and i18n audit (en · es · eu)

Audit date: **2026-10-27**. Locales: English, Spanish, Basque (`i18n/routing.ts`).

## Locale completeness

| Check | Status | Evidence |
|-------|--------|----------|
| Message files exist for all locales | ✅ | `lib/i18n/messages.test.ts` |
| Catalog keys aligned across locales | ✅ | Same test file |
| Spanish differs from English (not copy-paste) | ✅ | Sample key assertion |
| Public routes per locale | ✅ | Playwright `e2e/public-locales.spec.ts` |

## Guest surfaces (all locales)

| Route | UX notes |
|-------|----------|
| `/[locale]` | Marketing home; farm story and CTAs |
| `/[locale]/book` | Readiness-aware hero; prototype copy when not live |
| `/[locale]/manage-booking` | Reference + contact lookup; generic errors |
| `/[locale]/menu`, `/visit`, `/faq`, `/legal` | Completed pages per AGENTS.md |

## Staff / admin

| Surface | UX notes |
|---------|----------|
| `/staff/login`, `/admin/login` | Return path preserved (Playwright `e2e/floor-routes.spec.ts`) |
| Operations forms | Inline errors, pending states, preserved field values |
| Floor plan | Canvas + table states when DB seeded |

## Accessibility (spot check)

- Headings: book and manage-booking pages expose visible `h1` (Playwright role checks).
- Forms: labels tied to inputs in booking components (manual spot-check during staging E2E).

## Remaining (non-code)

- Professional Basque copy review by native speaker (content owner).
- Full WCAG audit before public launch (recommended external pass).
