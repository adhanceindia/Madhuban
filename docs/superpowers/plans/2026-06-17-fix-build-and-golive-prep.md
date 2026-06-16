# Fix Build + Go-Live Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npm run build` compile cleanly (unblocking Vercel deploy) by fixing the `apiHandler` route-context typing, clear the lint warnings, and rewrite the stale `GO_LIVE_CHECKLIST.md` to match the current Drizzle/Supabase/5-gateway stack.

**Architecture:** The build break is a single-point type defect in the `apiHandler` factory (`lib/api-handler.ts`), whose returned handler's second argument (`ctx?: NextContext<TParams>`) is incompatible with the `RouteContext` type Next.js 15.4 generates and type-checks against. Fixing the factory signature fixes all 26 admin routes at once. There is **no test runner** in this repo, so the verification gate for code tasks is `npm run build` (which runs `tsc` route-type validation) plus `npm run lint`.

**Tech Stack:** Next.js 15 (App Router), TypeScript (ESM), Drizzle ORM, Supabase Auth, Zod, 5 payment gateways, Upstash QStash (cron), Resend.

---

## File Structure

- `lib/api-handler.ts` — **modify**. The `apiHandler` factory. Replace the `NextContext<TParams>` type and the returned handler's second-arg signature so it matches Next's generated `RouteContext`, then cast params to `TParams` internally. This is the only file that needs changing to fix the build.
- `app/api/cron/sync-ical/route.ts` — **modify**. Remove unused `inArray` import and unused `_request` param (lint warnings).
- `components/admin/gallery/GalleryGrid.tsx` — **modify**. Remove unused `X` import.
- `components/admin/settings/PaymentConfigForm.tsx` — **modify**. Remove unused `config` variable.
- `components/admin/layout/sidebar.tsx` — **modify**. Add `alt` prop to the logo `<Image>`.
- `components/gallery/gallery-page-view.tsx` — **modify**. Fix `useMemo` exhaustive-deps warning.
- `GO_LIVE_CHECKLIST.md` — **rewrite**. Replace all Payload/Vercel-Cron/Razorpay-only references with the current custom-admin / QStash / 5-gateway reality.

No new files. No schema changes.

---

## Task 1: Fix the `apiHandler` route-context type (build blocker)

**Files:**
- Modify: `lib/api-handler.ts:42` (the `NextContext` type) and `lib/api-handler.ts:44-67` (the returned handler signature + param resolution)

**Background — the exact contract.** Next.js 15.4 generates, per route, a type file under `.next/types/` containing:

```ts
type SegmentParams<T extends Object = any> = T extends Record<string, any>
  ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
  : T
type RouteContext = { params: Promise<SegmentParams> }
```

It then asserts the handler's **second argument** is assignable from `RouteContext`. The current signature `ctx?: NextContext<TParams>` resolves to `{ params: Promise<Record<string,string>> } | undefined`, which fails because (a) the `| undefined` is not a valid `RouteContext` ("got undefined"), and (b) `Record<string,string>` is narrower than `SegmentParams` (whose values are `string | string[] | undefined`). Next always passes a context object at runtime (with empty `params` for non-dynamic routes), so the argument can be required. The fix decouples Next's wire type from the consumer-facing `TParams` by typing `ctx` to match `RouteContext` exactly and casting to `TParams` inside.

- [ ] **Step 1: Capture the current failing build (the "red" state)**

Run: `npm run build 2>&1 | grep -A4 "Type error"`
Expected: FAIL — output includes
```
app/api/admin/analytics/route.ts
Type error: Route "app/api/admin/analytics/route.ts" has an invalid "GET" export:
  Type "NextContext<Record<string, string>> | undefined" is not a valid type for the function's second argument.
```

- [ ] **Step 2: Replace the `NextContext` type definition**

In `lib/api-handler.ts`, replace this line:

```ts
type NextContext<TParams> = { params: Promise<TParams> }
```

with a type that mirrors Next's `RouteContext` wire shape (values may be `string | string[] | undefined`, matching `SegmentParams`):

```ts
// Mirrors the `RouteContext` type Next.js generates and type-checks route
// handlers against. Params are cast to the handler's TParams internally.
type NextRouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>
}
```

- [ ] **Step 3: Update the returned handler signature and param resolution**

In `lib/api-handler.ts`, change the returned function's second argument from optional `NextContext<TParams>` to the required `NextRouteContext`, and update the param-resolution line to cast.

Replace:

```ts
  return async (request: NextRequest, ctx?: NextContext<TParams>) => {
```
with:
```ts
  return async (request: NextRequest, ctx: NextRouteContext): Promise<NextResponse> => {
```

Then replace the param-resolution line (currently line ~66):

```ts
      const params = ctx ? await ctx.params : ({} as TParams)
```
with:
```ts
      const params = ((await ctx?.params) ?? {}) as unknown as TParams
```

Leave the rest of the factory (session check, RBAC, Zod validation, handler call, audit, error catch) unchanged.

- [ ] **Step 4: Verify the route type-check passes (the "green" state)**

Run: `npm run build`
Expected: PASS — `✓ Compiled successfully`, then `Linting and checking validity of types` completes, then `Generating static pages` / `Route (app)` table prints with **no** `Type error:` and **no** `Failed to compile.` In particular, `app/api/admin/analytics/route.ts` no longer errors, and no other `app/api/admin/**` route reports an invalid second-argument type.

> If a `[id]` route now reports a different type error, it is the same class of issue — confirm its second arg flows through the factory (it should, since all routes call `apiHandler`) and that the consumer is not passing its own incompatible `ctx`. No route handler should declare its own second parameter; they all return `apiHandler({...})` directly.

- [ ] **Step 5: Commit**

```bash
git add lib/api-handler.ts
git commit -m "fix(api): align apiHandler ctx type with Next 15 RouteContext to unblock build"
```

---

## Task 2: Clear the ESLint warnings

**Files:**
- Modify: `app/api/cron/sync-ical/route.ts:4` and `:98`
- Modify: `components/admin/gallery/GalleryGrid.tsx:4`
- Modify: `components/admin/settings/PaymentConfigForm.tsx:20`
- Modify: `components/admin/layout/sidebar.tsx:45`
- Modify: `components/gallery/gallery-page-view.tsx:49`

- [ ] **Step 1: Confirm the current warnings**

Run: `npm run lint`
Expected: completes with warnings for: unused `inArray` and `_request` (sync-ical), unused `X` (GalleryGrid), unused `config` (PaymentConfigForm), missing `alt` (sidebar), and `useMemo` missing dependency `galleryItems` (gallery-page-view).

- [ ] **Step 2: Remove unused `inArray` import in sync-ical**

In `app/api/cron/sync-ical/route.ts`, remove `inArray` from the `drizzle-orm` import on line 4 (keep the other named imports). If `inArray` is the only import from that statement, delete the whole line.

- [ ] **Step 3: Remove the unused `_request` parameter in sync-ical**

In `app/api/cron/sync-ical/route.ts` around line 98, the handler signature declares `_request` but never uses it. If the export is `export async function POST(_request: Request) {`, change it to `export async function POST() {`. Do not remove the parameter if it is required by a wrapper signature — verify by reading the function; if unused, drop it.

- [ ] **Step 4: Remove unused `X` import in GalleryGrid**

In `components/admin/gallery/GalleryGrid.tsx` line 4, remove `X` from the `lucide-react` import list (keep the other icons).

- [ ] **Step 5: Remove unused `config` variable in PaymentConfigForm**

In `components/admin/settings/PaymentConfigForm.tsx` around line 20, delete the `const config = ...` assignment that is never read. If the right-hand side has a side effect (e.g. a hook call), keep the call but drop the unused binding.

- [ ] **Step 6: Add `alt` to the sidebar logo image**

In `components/admin/layout/sidebar.tsx` around line 45, add an `alt` prop to the `<Image>`:

```tsx
alt="Madhuban Garden Resort"
```

- [ ] **Step 7: Fix the `useMemo` dependency in gallery-page-view**

In `components/gallery/gallery-page-view.tsx` around line 49, add the missing `galleryItems` to the `useMemo` dependency array (append it to the existing deps). Only do this if `galleryItems` is a stable prop/state value; if it is a freshly-created array each render, leave a one-line comment and skip rather than introduce a re-render loop.

- [ ] **Step 8: Verify clean lint + build still green**

Run: `npm run lint && npm run build`
Expected: lint prints no warnings for the six items above; build still ends with the route table and no errors.

- [ ] **Step 9: Commit**

```bash
git add app/api/cron/sync-ical/route.ts components/admin/gallery/GalleryGrid.tsx components/admin/settings/PaymentConfigForm.tsx components/admin/layout/sidebar.tsx components/gallery/gallery-page-view.tsx
git commit -m "chore(lint): remove unused imports/vars, add image alt, fix useMemo deps"
```

---

## Task 3: Rewrite `GO_LIVE_CHECKLIST.md` for the current stack

**Files:**
- Rewrite: `GO_LIVE_CHECKLIST.md`

**Background — what is wrong today.** The current checklist references a Payload CMS admin panel, `PAYLOAD_SECRET`, Vercel Cron with `CRON_SECRET`, and Razorpay-only env vars. The live app has a **custom React admin** at `/admin`, uses **Upstash QStash** for the iCal cron (verified via `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`, not `CRON_SECRET`), supports **5 payment gateways**, and stores content in the `site_content` table edited via `/admin/content` and `/admin/settings`. Source of truth for env vars and flows is `.claude/CLAUDE.md`.

- [ ] **Step 1: Confirm the authoritative env-var and flow list**

Read `.claude/CLAUDE.md` sections "Required env vars" and the Channel Manager / Booking flows. Cross-check against `.env.example`.

Run: `cat .env.example` and note any vars present there but missing from CLAUDE.md (and vice-versa).

- [ ] **Step 2: Rewrite the Site URLs and Env Vars sections**

Replace the top of `GO_LIVE_CHECKLIST.md` so that:
- The admin URL is described as "custom admin panel" (not "Payload CMS admin panel").
- The env-var table lists exactly the variables from CLAUDE.md's "Required env vars": `DATABASE_URI`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_S3_BUCKET`, `SUPABASE_S3_ACCESS_KEY`, `SUPABASE_S3_SECRET_KEY`, `SUPABASE_S3_ENDPOINT`, `NEXT_PUBLIC_SERVER_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `RESEND_API_KEY`, `ADMIN_EMAIL`.
- Payment credentials are described generically as "credentials for the active gateway (Razorpay / PhonePe / Cashfree / CCAvenue / PayU), configured in `/admin/settings/payment`" rather than hard-coding Razorpay-only keys. Remove `PAYLOAD_SECRET` and `CRON_SECRET` entirely.

- [ ] **Step 3: Rewrite the Content Setup section for the custom admin**

Replace the "via /admin (Payload)" instructions with the current routes:
- Site identity / contact / hero: `/admin/settings/site` and `/admin/content` (per-page editor, schema from `lib/cms-schema.ts`).
- Rooms: `/admin/rooms` → New (set `is_active = true` to publish).
- Gallery: `/admin/gallery` (upload + categories + reorder).
- Reviews: `/admin/reviews` → New (publish toggle).
- Payment config: `/admin/settings/payment` (select `active_gateway`, enter credentials, switch to production).
- OTA iCal URLs: `/admin/channel-manager`.

- [ ] **Step 4: Rewrite the iCal/Cron and E2E sections**

- iCal export URL stays `https://madhubangarden.com/api/ical/export`.
- Replace "Vercel Cron every 30 minutes" with "Upstash QStash schedule calling `POST /api/cron/sync-ical`, verified via QStash signing keys." Update the E2E line that tested `Authorization: Bearer {CRON_SECRET}` to instead state the route rejects requests without a valid QStash signature (401).
- Update the E2E payment lines to "test the active gateway end-to-end (order → gateway → webhook/callback → booking confirmed → Resend email)".
- Update any "Payload admin login → collections visible" line to "`/admin/login` → dashboard → all modules visible per role (RBAC)".

- [ ] **Step 5: Verify no stale references remain**

Run: `grep -niE "payload|prisma|CRON_SECRET|PAYLOAD_SECRET|vercel cron" GO_LIVE_CHECKLIST.md`
Expected: no matches (exit code 1, no output).

- [ ] **Step 6: Commit**

```bash
git add GO_LIVE_CHECKLIST.md
git commit -m "docs: rewrite go-live checklist for custom admin, QStash cron, 5-gateway payments"
```

---

## Verification (after all tasks)

- [ ] `npm run build` exits 0 with the route table printed and no `Type error` / `Failed to compile`.
- [ ] `npm run lint` reports no warnings for the six items in Task 2.
- [ ] `grep -rniE "payload|prisma" GO_LIVE_CHECKLIST.md` returns nothing.
- [ ] `git log --oneline -3` shows the three commits above.

## Out of scope (tracked, not done here)

- Operational go-live content entry (real rooms/photos/reviews/payment credentials) — done by staff in the admin, not code.
- Manual E2E run on a live/preview deploy (no automated test runner exists).
- Calendar "click-to-block / drag-to-create" advanced sub-task (Phase 2 plan Task 4, Step 8) — confirm separately whether it was completed.
