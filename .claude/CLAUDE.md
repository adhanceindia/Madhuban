# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Madhuban Garden Resort

A full-stack resort website **and** custom admin panel for Madhuban Garden Resort (Agar Malwa District, MP). Next.js 15 App Router, Drizzle ORM over Supabase Postgres, Supabase Auth, and a 5-gateway payment system. Single Vercel deployment.

> **Stale-docs warning.** `README.md` and `AGENTS.md` predate the current build — they describe a "Phase 1 frontend with dummy data", Prisma, Next.js 14, Razorpay-only, and a `UI design/` reference folder. **All of that is obsolete. This file is the single source of truth.** Payload CMS was fully removed (no package, no imports, no config); only inert leftovers remain — stale code comments, the unused `@payload-config` alias in `tsconfig.json`, and cleanup scripts in `scripts/` that intentionally name old `payload_*` tables.

---

## Commands

```bash
npm run dev            # Next.js dev server (localhost:3000)
npm run build          # Production build — RUN THIS before every push to Vercel
npm run start          # Serve the production build
npm run lint           # next lint (ESLint, eslint-config-next)
npm run format         # prettier --write .   (also: npm run format:check)

npm run db:generate    # drizzle-kit generate — create a migration from schema changes
npm run db:push        # drizzle-kit push — apply schema directly to Supabase Postgres
npm run db:studio      # drizzle-kit studio — browse the DB

npm run seed           # Seed the DB (scripts/seed.ts via tsx)
```

One-off operational scripts in `scripts/` run via `tsx` and load `.env.local` through `preload.cjs`:
- `npx tsx scripts/create-admin.ts` — create a staff account (Supabase Auth user + `users` row)
- `scripts/insert-user-row.ts`, `scripts/migrate.ts`, `scripts/cleanup-old-tables.ts`

**There is no test runner** — no `npm test`. Verify changes with `npm run build` plus manual checks.

Drizzle reads `DATABASE_URI` from `.env.local` (see `drizzle.config.ts`; schema entry `db/schema/index.ts`, migrations in `db/migrations/`).

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (ESM — `"type": "module"`) |
| Database | Supabase PostgreSQL |
| ORM | Drizzle ORM (`postgres-js` driver) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Admin UI | shadcn/ui + Radix |
| Data tables | TanStack Table |
| Charts | Recharts |
| Styling | Tailwind CSS 3.4 |
| Validation | Zod |
| Media storage | Supabase S3 |
| Payments | Razorpay, PhonePe, Cashfree, CCAvenue, PayU |
| Email | Resend |
| Caching / rate limit | Upstash Redis |
| Cron | Upstash QStash (iCal sync) |
| iCal | node-ical (import) + ical-generator (export) |
| Image processing | sharp |
| Animations | framer-motion (public site) |
| Hosting | Vercel |

---

## Architecture — the patterns that matter

These are the load-bearing abstractions. Read them before touching API routes or auth.

### 1. Module imports

- Path alias `@/*` → repo root (`tsconfig.json`).
- ESM only — no `require()` in app code. `tsconfig` enables `allowImportingTsExtensions`, so some files import with explicit `.ts` extensions (e.g. `lib/auth.ts`) while others omit them (e.g. `lib/audit.ts`). Both work; match the file you're editing.

### 2. Lazy service clients (Vercel-critical)

Anything reading `process.env` must be constructed **inside a function**, never at module scope, or Vercel build/runtime breaks.

```ts
// db/client.ts — the canonical pattern
let _db = null
export function getDb() {
  if (!_db) {
    const client = postgres(process.env.DATABASE_URI!, { max: 10 })
    _db = drizzle(client, { schema })
  }
  return _db
}
```

Same rule for Redis, Supabase clients, payment gateways, Resend.

### 3. `apiHandler` factory — `lib/api-handler.ts`

**Every admin API route is wrapped in `apiHandler(...)`.** It enforces, in order: session check → module RBAC (`canAccess`) → optional explicit role check → param resolution → Zod body validation (skipped for GET/DELETE) → handler → audit log → JSON response, with centralized error/Zod catching.

```ts
export const POST = apiHandler({
  module: 'rooms',                       // canAccess(role, module) gate
  schema: roomCreateSchema,              // Zod schema from lib/schemas/
  audit: { action: 'room.created', entityType: 'room', entityIdFrom: 'result', entityIdKey: 'id' },
  handler: async ({ session, body, params, searchParams }) => {
    // business logic; return value is JSON-serialized
  },
})
```

When adding an admin route: pick the `module` key, add a Zod schema in `lib/schemas/`, and supply an `audit` config for mutations.

### 4. Auth & sessions — `lib/auth.ts` + `lib/permissions.ts`

- `getSession()` (server-only): reads the Supabase auth user, looks up the matching row in `users` by `auth_id`, returns `SessionUser { id, auth_id, name, email, role }`, or `null` if no user / `is_active` is false.
- `middleware.ts` only guards **presence** of a session: unauthenticated `/admin/*` → redirect to `/login`; authenticated on `/login` → redirect to `/admin`. Matcher: `['/admin/:path*', '/login']`. **It does not check roles** — role enforcement lives in `apiHandler` (`canAccess`) and in server components.
- `canAccess(role, module)` in `lib/permissions.ts` holds the authoritative module→roles matrix (see RBAC below). `hasRole(role, [...])` for ad-hoc checks.

### 5. Payments — `lib/payments/`

- `resolveActiveGateway()` (`resolve-gateway.ts`) reads `payment_config`, validates the active gateway's required credentials, checks `<gateway>_enabled`, and returns the matching gateway class. The 5 gateways each implement a common `PaymentGateway` interface (`razorpay.ts`, `phonepe.ts`, `cashfree.ts`, `ccavenue.ts`, `payu.ts`).
- Razorpay / PhonePe / Cashfree use **webhooks** (`app/api/payments/webhooks/*`, verify signatures). CCAvenue / PayU use **redirect initiate + callback** (`app/api/payments/initiate/*`, `app/api/payments/callbacks/*`).

### 6. CMS content — `lib/cms-schema.ts` + `site_content`

Public-page content is schema-driven: `lib/cms-schema.ts` defines the editable fields per page; the admin editor at `/admin/content/[page]` renders from that schema and writes JSON into the `site_content` table. Public pages read it via `lib/data.ts` / `lib/page-content.ts`.

### 7. Audit logging — `lib/audit.ts`

`logAudit({ user_id, action, entity_type, entity_id, old_value, new_value })` writes to `audit_log`. The `apiHandler` `audit` option calls this automatically; call it directly for mutations outside the factory.

---

## Directory Map

```
app/
  (pages)/                Public site: rooms/[slug], wedding, banquet, pool, events,
                          attractions, gallery, contact, booking/status
  (admin)/
    login/                Auth page (route is /login via route group)
    admin/                Admin panel — dashboard + module pages (see Modules)
  api/
    admin/*               Authenticated admin endpoints (wrapped in apiHandler)
    availability, bookings, inquiry, dashboard, front-desk   Public/site endpoints
    payments/{order,initiate,callbacks,webhooks}             5-gateway flows
    ical/export, cron/sync-ical                              iCal sync
db/
  schema/                 Drizzle tables (index.ts re-exports all — the only barrel file)
  migrations/             drizzle-kit output
  client.ts               Lazy getDb()
lib/
  api-handler.ts          apiHandler factory (READ THIS)
  auth.ts, permissions.ts RBAC
  schemas/                Per-entity Zod schemas for API inputs
  payments/               Gateway implementations + resolver
  supabase/{server,client}.ts
  cms-schema.ts, page-content.ts, data.ts   CMS
  audit.ts, redis.ts, email.ts, format.ts, utils.ts
components/
  admin/<module>/         Admin UI grouped by module (+ layout/, shared/)
  ui/                     shadcn/ui
  rooms/ gallery/ wedding/ contact/ layout/   Public site
middleware.ts             Session presence guard for /admin + /login
scripts/                  Seed + ops scripts (tsx)
```

---

## Database Schema (`db/schema/`)

| Table | Purpose |
|---|---|
| `rooms` | Room inventory: pricing, amenities, images |
| `bookings` | Guest reservations + payment tracking |
| `inquiries` | Event/wedding inquiry submissions |
| `blocked_dates` | Calendar blocking (manual + iCal sync) |
| `gallery` | Categorized photo/video items |
| `reviews` | Guest reviews with publish control |
| `media` | Upload metadata (Supabase S3) |
| `users` | Staff accounts; `auth_id` links to Supabase Auth, `role` enum, `is_active` |
| `site_content` | Per-page editable CMS content |
| `payment_config` | Gateway settings + `active_gateway` |
| `audit_log` | Staff action tracking |

Schema workflow: edit `db/schema/*.ts` → `npm run db:generate` → `npm run db:push`.

---

## RBAC

Roles (enum on `users.role`): `super_admin`, `resort_manager`, `front_desk`, `event_manager`, `accountant`, `content_manager`.

Authoritative module access matrix (from `lib/permissions.ts` `canAccess`):

| Module | Allowed roles |
|---|---|
| `dashboard` | all roles |
| `bookings` | super_admin, resort_manager, front_desk, accountant |
| `rooms` | super_admin, resort_manager |
| `front-desk` | super_admin, resort_manager, front_desk |
| `calendar` | super_admin, resort_manager, front_desk |
| `channel-manager` | super_admin, resort_manager |
| `gallery` | super_admin, resort_manager, event_manager, content_manager |
| `reviews` | super_admin, resort_manager, event_manager, content_manager |
| `inquiries` | super_admin, resort_manager, front_desk, event_manager |
| `content` | super_admin, resort_manager, content_manager |
| `analytics` | super_admin, resort_manager, accountant |
| `audit-log` | super_admin |
| `users` | super_admin |
| `settings` | super_admin |

---

## Admin Modules (`app/(admin)/admin/`)

`dashboard` (KPIs, availability grid, revenue chart) · `bookings` (+`[id]`, `new`) · `front-desk` (arrivals/departures, check-in/out, room status) · `calendar` (rooms×dates grid) · `channel-manager` (OTA/iCal status, conflict detection) · `gallery` (grid + reorder + upload) · `reviews` (+`new`) · `inquiries` (+`[id]`, status pipeline) · `content` (+`[page]`, schema-driven editor) · `analytics` (revenue/occupancy/sources) · `audit-log` (filterable feed, JSON diff) · `users` (+`[id]`, `new`, super_admin only) · `settings` (`payment`, `site`).

---

## Key Flows

**Booking:** site selects room+dates → `GET /api/availability` (checks `blocked_dates` + `bookings`) → guest form → online (`POST /api/payments/order` → gateway → webhook confirms) or pay-at-reception (`POST /api/bookings`, pending) → Resend confirmation → appears in admin.
Pricing: `subtotal = nights × price_per_night` → `GST = subtotal × 0.12` → `total = subtotal + GST`.

**Front desk:** walk-in → create booking → room `available → occupied`. Check-out → `occupied → checkout_pending` → invoice → `→ available` after cleaning.

**iCal sync:** export `GET /api/ical/export` (confirmed bookings → `.ics`). Import `POST /api/cron/sync-ical` (QStash ~30 min, verify signing keys) → pull OTA feeds → parse → upsert into `blocked_dates`. New bookings check `blocked_dates` for OTA conflicts and flag double-bookings in the audit log + dashboard alert.

---

## Hard Rules

- No Payload CMS, no Prisma — Drizzle only. No custom auth — Supabase Auth only.
- No module-level `process.env` reads — lazy-init all service clients (§2).
- No runtime filesystem writes (Vercel is read-only) — uploads go to Supabase S3.
- No internal REST-to-REST calls — query Drizzle directly in server components / route handlers.
- Wrap every admin API route in `apiHandler`; Zod-validate all inputs; audit every mutation.
- Verify payment webhook signatures; verify QStash signing keys on cron.
- Rate-limit public APIs (bookings, inquiry, payments) via Upstash Redis.
- Run `npm run build` locally before pushing to Vercel.

---

## Design System (admin panel)

Garden-resort identity: warm, professional, green & natural. Desktop-first (full experience ≥1024px; sidebar collapses below).

**Tokens**
```
--background: #f8f9f4   --foreground: #111827   --card: #ffffff
--primary: #386a0e (brand green)   --primary-light: #eef4e7
--gold: #ba7517   --gold-light: #fef3c7
--muted: #f3f4f6   --muted-foreground: #6b7280
--border: #e5e7eb   --ring: #386a0e
```

**Type:** Plus Jakarta Sans (display + body), Geist Mono (numbers/data, tabular).
**Radius:** inputs/buttons 8px, cards 12px, modals 16px, badges full.
**Depth:** subtle — cards `shadow-sm`, popovers `shadow-md`, modals `shadow-lg`. Borders whisper-quiet; active state = background shift, not outline.

**Status palette:** confirmed = green · pending = amber · cancelled = red · checked-in = blue · blocked = gray · maintenance = orange.

**Signature element:** the room availability calendar grid (rooms on Y, dates on X, color-coded status) — the operational anchor for front-desk staff.

**Patterns:** KPI cards (large mono number, uppercase muted label, colored top border, trend arrow) · TanStack tables (44px rows, sticky uppercase header, hover shift, filter bar) · pill status badges · 260px sidebar (icon+label, active = primary tint) · Recharts (minimal axes, soft tooltips, `chart-1..5` palette).

**Interactions:** optimistic status updates · `react-hot-toast` for mutations · confirm dialogs for destructive actions · inline editing where possible · loading skeletons · empty states with CTA · Cmd+K quick search (front desk).

---

## Conventions

- Components: `kebab-case.tsx`. Schema files: `kebab-case.ts`. API routes: `route.ts`.
- Types co-located in `lib/types.ts` or beside schema.
- No barrel files except `db/schema/index.ts`.
