# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## ReviewPlate — SaaS NFC/QR Review Cards

### Architecture
- **Backend**: Express API server on port 8080 (`artifacts/api-server`)
- **Frontend**: React + Vite on port 24668 (`artifacts/reviewplate`)
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **Auth**: JWT in localStorage key `reviewplate_token`; bcryptjs (pure JS, no native bindings)

### Design System
- Primary: `#F59E0B` (Amber Gold)
- Dark sidebar: `#0D1117` (Deep Night)
- Success: `#10B981` (Emerald)
- Background: `#F8FAFC`
- Font: Inter

### Activation Codes (Seeded)
6006 activation codes imported into `cards` table (all `status='inactive'`, `owner_id=NULL`):
- **GM-** prefix → `platform='google'` (1001 codes)
- **AB-** prefix → `platform='airbnb'` (1001 codes)
- **TA-** prefix → `platform='tripadvisor'` (1001 codes)
- **TP-** prefix → `platform='trustpilot'` (1001 codes)
- **ML-** prefix → `platform='multilink'` (1001 codes)
- **SO-** prefix → `platform='social'` (1001 codes)

Redirect URL format: `https://www.avismaker.com/r/{CODE}` (stored as `target_url`; users update this to their actual business review page after activation)

### Key API Routes
- `POST /api/auth/login|register` — Auth
- `GET  /api/public/card/:code` — Public card info (no auth)
- `POST /api/public/scan/:code` — Log scan + increment counter (no auth)
- `POST /api/cards/activate-by-code` — User claims a card by code (auth required)
- `PATCH /api/cards/:id` — Update card settings
- `GET  /api/analytics/summary` — Analytics dashboard
- `POST /api/ai/reply` — Generate AI review reply (Premium+)
- `GET  /api/subscriptions/plans` — List plans
- `POST /api/stripe/checkout` — Create Stripe checkout session (returns `{ url }`)
- `POST /api/stripe/portal` — Open Stripe billing portal (returns `{ url }`)
- `POST /api/stripe/webhook` — Stripe webhook endpoint (raw body, before express.json)

### Stripe Setup (COMPLETED & VERIFIED)
- Connection: `conn_stripe_01KNEDTY1T4MAZ4YAAMKFMP166` (sandbox)
- Products seeded: AvisMaker Premium (€19/mo, €171/yr), AvisMaker Business (€49/mo, €441/yr)
- Price metadata: `planId` (premium|business) + `billing` (monthly|annual)
- `stripe-replit-sync` externalized in esbuild (build.mjs) — CRITICAL for `runMigrations` to work
- `syncBackfill({ object: "all" })` called on startup to populate stripe.* tables
- Checkout route falls back to Stripe API if `stripe.products`/`stripe.prices` not yet synced
- Webhook handles: `checkout.session.completed`, `customer.subscription.deleted`

### Subscription Plans
- Free: 1 profile, 1 active card, no AI Reply
- Premium (€19/mo): 3 active cards, 1 profile, AI Reply enabled
- Business (€49/mo): unlimited, AI Reply enabled

### Internationalization (i18n)
- Library: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- Config: `artifacts/reviewplate/src/i18n/index.ts`
- Supported languages: en, fr, es, de, it, nl (defaulting to en)
- Lang stored in `localStorage` key `avismakers_lang`
- Translation files: `artifacts/reviewplate/src/i18n/locales/{lang}.json`
- `LanguageSwitcher` component: available as `variant="dark"` or `"light"` — placed in navbar (landing/auth pages) and sidebar bottom
- All main pages use `useTranslation()` hook: landing, login, signup, dashboard, billing, ai-reply, activate, AppSidebar
- i18n initialized in `main.tsx` via `import "./i18n"`

### Important Notes
- esbuild bundles the API server; do NOT use `zod/v4` subpath in api-server — use `@workspace/api-zod` schemas instead
- `businessProfileId` in `activate-by-code` is optional (nullable)
- Public scan page at `/c/:code` uses `useGetPublicCard()` to fetch card, then auto-redirects
- Legacy `GET /public/scan` endpoint removed — only `POST /public/scan/:code` is used
- `scanCount` incremented atomically via SQL expression (`scanCount + 1`) to avoid race conditions
- All routes in `App.tsx` are lazy-loaded via `React.lazy` for faster initial bundle
- N+1 DB queries eliminated in `analytics.ts` (inArray) and `business-profiles.ts` (2 queries per profile)
- `checkActivationLimit` helper in `cards.ts` replaces duplicated plan limit logic
