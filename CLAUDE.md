# NovaTrace — EcoNova Trace

## What This Is
Traceability system for circular economy: agricultural plastic → pyrolysis → fuel oil → digital certificate.
Tracks the full chain: feedstock origin → pyrolysis process → lab testing → verified GHG impact.
Company: EcoNova México. Domain: trace.econova.com.mx

## Stack
- Next.js 14 (App Router) + React 18 + TypeScript
- PostgreSQL (Neon) + Prisma 6.3
- Tailwind CSS 3.4 (custom `eco-*` design tokens, no UI library)
- Auth: JWT via `jose` (HS256, edge-compatible), cookie `econova-token`
- AI: Nova AI Gateway (external, Railway) with SSE streaming
- Deploy: Railway (nixpacks) or Vercel. DB on Neon.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — `prisma generate && next build`
- `npm run db:push` — Push schema to DB
- `npm run db:migrate` — Run migrations
- `npm run db:seed` — Base seed (2 batches)
- `npm run db:seed-flii` — Full 12-batch learning curve dataset
- `npm run db:studio` — Prisma Studio GUI

## Architecture
- Route groups: `(dashboard)/` = protected, `(public)/` = no auth, `/login` = auth page
- Pages are async Server Components that query Prisma directly, pass JSON to client components
- API routes at `src/app/api/` — all validated with Zod schemas (`src/lib/validations.ts`)
- Middleware (`src/middleware.ts`) protects all routes except public ones
- No Redux/Zustand — local useState + props drilling

## Key Files
- `src/lib/ghg.ts` — GHG calculator (IPCC 2006, ISO 14040). Core business logic.
- `src/lib/nova-ai.ts` — Nova AI Gateway integration with in-memory cache (30min active, 24h completed)
- `src/lib/auth.ts` — JWT sign/verify, getSession(), requireAuth(), requireRole()
- `src/lib/utils.ts` — Batch code generation (format: `{YearLetter}/{Month}/1/{FeedstockCode}/{Seq}`)
- `prisma/schema.prisma` — 7 models: User, Batch (~80 fields), Reading, ProcessEvent, Photo, LabResult, Certificate
- `prisma/seed-perfect.ts` — Exemplar 450kg batch with 109 readings, 26 events

## Conventions
- UI language: Spanish (es-MX). Code/comments: English.
- Color palette: `eco-navy`, `eco-green`, `eco-ink`, `eco-muted` — defined in `tailwind.config.ts`
- Batch codes encode: year (A=2024,B=2025,C=2026), month, reactor, feedstock type, sequence
- Certificate codes: 8-char alphanumeric, SHA-256 hash of batch data
- Roles: ADMIN (full), OPERATOR (create/update batches), VIEWER (read-only)
- GHG auto-calculated on batch completion (PATCH with status=COMPLETED + oilOutput)

## Environment Variables
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — HS256 secret (generate: `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` — App URL
- `NOVA_GATEWAY_URL` — Nova AI Gateway endpoint
- `NOVA_API_KEY` — Bearer token for Nova AI

## Gotchas
- Prisma client singleton in `src/lib/prisma.ts` — uses globalThis caching in dev to avoid connection exhaustion
- `JSON.parse(JSON.stringify(batch))` pattern used to serialize Prisma objects (dates, Decimal) before passing to client components
- Images configured for Cloudinary remote patterns in `next.config.js` (Phase 2, not yet active)
- Cascade delete on all batch children — deleting a batch removes all readings, events, photos, lab results, certificates
