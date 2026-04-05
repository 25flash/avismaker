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
- `POST /api/subscriptions/upgrade` — Upgrade plan

### Subscription Plans
- Free: 1 profile, no AI Reply
- Premium: 3 profiles, AI Reply enabled
- Pro: 10 profiles, AI Reply enabled
- Business: unlimited profiles, AI Reply enabled

### Important Notes
- esbuild bundles the API server; do NOT use `zod/v4` subpath in api-server — use `@workspace/api-zod` schemas instead
- `businessProfileId` in `activate-by-code` is optional (nullable)
- Public scan page at `/c/:code` uses `useGetPublicCard()` to fetch card, then auto-redirects
