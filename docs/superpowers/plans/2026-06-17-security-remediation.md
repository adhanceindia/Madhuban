# Security Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all findings from the 2026-06-17 security audit, taking the app from ~5.5/10 to a 9/10-capable production security posture.

**Architecture:** Layered hardening on the existing Next.js 15 / Drizzle / Supabase stack. We add a perimeter (security headers, RLS, restricted DB role), strengthen identity (server-side login limiter, opt-in MFA, password policy), harden data paths (upload validation, payment amount cross-check, email escaping, secret encryption), and add operational security (CI/CD scanning, observability, docs). No framework changes.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Supabase Auth + Postgres + Storage, Upstash Redis, Resend, Vercel.

---

## ⚠️ Important conventions for this plan

- **There is no test runner in this repo** (`npm test` does not exist). The TDD "write a failing test" cycle is replaced with concrete **verification steps**: `npm run build`, `npm run lint`, `curl` probes, and manual checks. Every task ends with a verification + commit step.
- **Run `npm run build` before every commit** (project hard rule).
- **Branch first** — do not commit security work directly to `main`. Create `git checkout -b security/remediation` before Task 1.
- **Match existing import style:** some files import with explicit `.ts` extensions (e.g. `'./auth.ts'`), others without. Match the file you edit.
- **Lazy service clients only** — never read `process.env` at module scope (Vercel hard rule). Follow the `getRedis()` / `getDb()` pattern.
- Decisions locked for this plan: **scope = P0→P2 (everything)**, **bot protection = Redis rate-limiting only (no CAPTCHA)**, **MFA = opt-in (not enforced)**.

## Severity calibration carried from audit re-verification

- `getSession()` re-reads `is_active` **and** `role` from the DB on every request, so deactivations/role-downgrades already take effect immediately at the API layer. "Logout from all devices" (Task 14) is therefore **Low** / defense-in-depth, not High.
- The payment **order amount is computed server-side**; client cannot set it, and webhooks are signature-verified. The amount cross-check (Task 11) is **Medium** defense-in-depth.
- `.env.local` is **not** committed (verified) — no secret-rotation task is needed unless a key was shared outside the repo.

## File map (what changes)

| Path | Action | Responsibility |
|---|---|---|
| `next.config.mjs` | modify | Security headers / CSP |
| `app/api/front-desk/route.ts` | modify | Add auth gate |
| `db/migrations/9999_enable_rls.sql` | create | Enable RLS + revoke anon grants |
| `scripts/apply-sql.ts` | create | Apply raw SQL files via postgres-js |
| `lib/rate-limit.ts` | create | Shared Redis limiter + lockout helpers |
| `app/api/auth/login/route.ts` | create | Server-side login w/ brute-force protection |
| `app/(admin)/login/page.tsx` | modify | POST to new login route |
| `lib/sanitize.ts` | create | `escapeHtml` / `stripHeader` |
| `lib/email.ts` | modify | Escape all guest input |
| `app/api/admin/media/upload/route.ts` | modify | Type/magic-byte/size validation, random names |
| `lib/payments/common.ts` | modify | `confirmBookingPayment` amount cross-check |
| `app/api/payments/webhooks/*`, `callbacks/*` | modify | Pass captured amount |
| `app/api/availability/route.ts` | modify | Add rate limit |
| `app/api/ical/export/route.ts` | modify | Require export token |
| `app/(pages)/booking/status/page.tsx` | modify | Email/phone gate |
| `lib/admin-users.ts` | modify | Revoke sessions on deactivate; sign-out-all |
| `lib/api-handler.ts` | modify | Origin check for mutations |
| `.github/workflows/ci.yml` | create | Lint, build, `npm audit`, CodeQL |
| `.github/dependabot.yml` | create | Dependency updates |
| `lib/crypto.ts` | create | AES-256-GCM for stored secrets |
| `lib/schemas/users.ts` | modify | Strong password policy |
| `app/api/auth/forgot-password/route.ts`, `app/(admin)/reset-password/page.tsx` | create | Self-serve reset |
| `components/admin/settings/mfa-card.tsx` + route | create | Opt-in TOTP MFA |
| `sentry.*.config.ts`, `lib/observability.ts` | create | Error + auth-event logging |
| `SECURITY.md`, `docs/security/*`, `public/.well-known/security.txt` | create | Compliance docs |

---

# PHASE 0 — Immediate (Critical / High)

### Task 1: Security headers & CSP

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Replace `next.config.mjs` with the headers-enabled version**

```js
/** @type {import('next').NextConfig} */

// CSP is shipped Report-Only first so it cannot break Razorpay/PhonePe/Cashfree
// checkout or Google Places. Watch the browser console for violations for ~1 week,
// then rename the header key to 'Content-Security-Policy' to enforce.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://mercury.phonepe.com https://sdk.cashfree.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.upstash.io https://api.razorpay.com https://api.cashfree.com https://maps.googleapis.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://mercury.phonepe.com https://sdk.cashfree.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://secure.ccavenue.com https://secure.payu.in",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=(self)' },
]

const nextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
```

- [ ] **Step 2: Build & verify headers are emitted**

Run: `npm run build && npm run start &` then in another shell `curl -sI http://localhost:3000/ | grep -iE 'content-security|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy'`
Expected: all six headers present. Stop the server afterward.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat(security): add security headers + report-only CSP"
```

- [ ] **Step 4 (follow-up, after ~1 week of clean reports):** change `Content-Security-Policy-Report-Only` to `Content-Security-Policy` and re-test checkout on the live public site.

---

### Task 2: Lock down `/api/front-desk` (confirmed unauthenticated PII leak)

**Files:**
- Modify: `app/api/front-desk/route.ts`

- [ ] **Step 1: Add auth + RBAC at the top of the `GET` handler**

Add the imports and the guard as the first lines inside `GET`:

```ts
import { getSession } from '@/lib/auth'
import { canAccess } from '@/lib/permissions'
// ...existing imports...

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || !canAccess(session.role, 'front-desk')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // ...existing body unchanged...
```

- [ ] **Step 2: Verify the front-desk admin page still works (it sends auth cookies)**

Run: `npm run build`
Then manual: log in as a `front_desk` user, open `/admin/front-desk`, confirm data loads. In an incognito window (logged out) `curl -s http://localhost:3000/api/front-desk` → expect `{"error":"Unauthorized"}` with 401.

- [ ] **Step 3: Commit**

```bash
git add app/api/front-desk/route.ts
git commit -m "fix(security): require auth+RBAC on /api/front-desk (PII leak)"
```

---

### Task 3: Enable Row Level Security + revoke anon grants

The app connects as the DB owner via `DATABASE_URI`, which **bypasses RLS** — so enabling RLS with no policies is safe for the app and blocks the public `anon`/`authenticated` PostgREST roles from reading any table.

**Files:**
- Create: `db/migrations/9999_enable_rls.sql`
- Create: `scripts/apply-sql.ts`

- [ ] **Step 1: Create the RLS migration**

```sql
-- db/migrations/9999_enable_rls.sql
-- Enable RLS on every table. App uses the owner connection (DATABASE_URI) which
-- bypasses RLS; the public anon/authenticated roles are denied (no policies).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'audit_log','blocked_dates','bookings','gallery','inquiries',
    'media','payment_config','reviews','rooms','site_content','users'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated;', t);
  END LOOP;
END $$;

-- Belt-and-suspenders: stop future tables from auto-granting to public roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
```

- [ ] **Step 2: Create a tiny SQL runner (no new deps — reuses `postgres`)**

```ts
// scripts/apply-sql.ts
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

async function main() {
  const file = process.argv[2]
  if (!file) throw new Error('Usage: tsx scripts/apply-sql.ts <path-to.sql>')
  const sql = postgres(process.env.DATABASE_URI!, { max: 1 })
  try {
    await sql.unsafe(readFileSync(file, 'utf8'))
    console.log(`Applied ${file}`)
  } finally {
    await sql.end()
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 3: Apply it**

Run: `npx tsx --require ./scripts/preload.cjs scripts/apply-sql.ts db/migrations/9999_enable_rls.sql`
Expected: `Applied db/migrations/9999_enable_rls.sql`

- [ ] **Step 4: Verify the public anon key can no longer read tables**

Run (substitute your live project URL + anon key; this is the audit Finding #2 test):
```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/bookings?select=*&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```
Expected: permission-denied error or `[]`, **not** booking rows.

- [ ] **Step 5: Verify the app still reads/writes (owner bypasses RLS)**

Run: `npm run build` then manual smoke test of the admin dashboard + a booking create.

- [ ] **Step 6: Commit**

```bash
git add db/migrations/9999_enable_rls.sql scripts/apply-sql.ts
git commit -m "feat(security): enable RLS + revoke anon grants on all tables"
```

---

### Task 4: Shared rate-limit/lockout helper + server-side login

**Files:**
- Create: `lib/rate-limit.ts`
- Create: `app/api/auth/login/route.ts`
- Modify: `app/(admin)/login/page.tsx`

- [ ] **Step 1: Create the shared limiter (centralizes the duplicated `isRateLimited` logic)**

```ts
// lib/rate-limit.ts
import { getRedis } from '@/lib/redis'

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Fixed-window limiter. Returns true when the caller is OVER the limit. */
export async function isRateLimited(key: string, max: number, windowSec: number): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false // fail-open (matches existing behavior)
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, windowSec)
    return count > max
  } catch {
    return false
  }
}

/** Login lockout: returns true while locked. Call recordFailure on bad password. */
export async function isLockedOut(email: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  const fails = await redis.get<number>(`login:fail:${email.toLowerCase()}`)
  return (fails ?? 0) >= 5
}

export async function recordLoginFailure(email: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const key = `login:fail:${email.toLowerCase()}`
  const n = await redis.incr(key)
  if (n === 1) await redis.expire(key, 900) // 15-minute window
}

export async function clearLoginFailures(email: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.del(`login:fail:${email.toLowerCase()}`)
}
```

- [ ] **Step 2: Create the server-side login route (sets Supabase auth cookies via the SSR client)**

```ts
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { clientIp, isRateLimited, isLockedOut, recordLoginFailure, clearLoginFailures } from '@/lib/rate-limit'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  if (await isRateLimited(`rl:login:${ip}`, 20, 900)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 })
  }
  const { email, password } = parsed.data

  if (await isLockedOut(email)) {
    return NextResponse.json(
      { error: 'Account temporarily locked due to failed attempts. Try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    await recordLoginFailure(email)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  await clearLoginFailures(email)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Point the login form at the new route**

In `app/(admin)/login/page.tsx`, replace the `createSupabaseBrowserClient` call inside `handleSubmit` with a fetch. Remove the now-unused `createSupabaseBrowserClient` import.

```tsx
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Invalid email or password')
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect') || '/admin'
    router.push(redirect)
    router.refresh()
  }
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Manual: valid login works; 5 wrong passwords for the same email → 6th returns the lockout 429; correct password after lockout window (15 min) works again.

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts app/api/auth/login/route.ts "app/(admin)/login/page.tsx"
git commit -m "feat(security): server-side login with brute-force limiter + lockout"
```

---

# PHASE 1 — Short-Term (High / Medium)

### Task 5: HTML/header escaping in transactional emails

**Files:**
- Create: `lib/sanitize.ts`
- Modify: `lib/email.ts`

- [ ] **Step 1: Create escaping helpers**

```ts
// lib/sanitize.ts
export function escapeHtml(input: unknown): string {
  return String(input ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  )
}

/** Strip CR/LF to prevent email header injection in subjects. */
export function stripHeader(input: unknown): string {
  return String(input ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120)
}
```

- [ ] **Step 2: Apply to every guest-derived interpolation in `lib/email.ts`**

Add `import { escapeHtml, stripHeader } from '@/lib/sanitize'` at the top. Then wrap each guest field used in an HTML template body with `escapeHtml(...)` (e.g. `${escapeHtml(guest_name)}`, `${escapeHtml(room_name)}`, `${escapeHtml(inquiry.name)}`, `${escapeHtml(inquiry.message)}`, `${escapeHtml(inquiry.email)}`, `${escapeHtml(inquiry.phone)}`) and wrap every `subject:` interpolation with `stripHeader(...)` (e.g. ``subject: `New ${eventLabel} Inquiry from ${stripHeader(inquiry.name)}` ``).

Find all sites: `grep -nE '\$\{[^}]*(name|email|phone|message|room_name)' lib/email.ts` — every match that comes from user input must be wrapped.

- [ ] **Step 3: Verify no raw guest interpolation remains**

Run: `grep -nE '\$\{(guest_name|guest_email|guest_phone|room_name|inquiry\.(name|email|phone|message))\}' lib/email.ts`
Expected: no matches (all are now wrapped in `escapeHtml`/`stripHeader`). Then `npm run build`.

- [ ] **Step 4: Commit**

```bash
git add lib/sanitize.ts lib/email.ts
git commit -m "fix(security): escape guest input in emails (XSS/header injection)"
```

---

### Task 6: File upload hardening

**Files:**
- Modify: `app/api/admin/media/upload/route.ts`

- [ ] **Step 1: Add a content-type/magic-byte allowlist and random filename**

Replace the filename/validation block (after the `file instanceof Blob` check, before the Supabase upload) with:

```ts
import crypto from 'node:crypto'
// ...

const ALLOWED = {
  'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  'image/png':  { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
  'image/gif':  { ext: 'gif', magic: [[0x47, 0x49, 0x46, 0x38]] },
  'video/mp4':  { ext: 'mp4', magic: [[0x66, 0x74, 0x79, 0x70]] },  // 'ftyp' at offset 4
} as const

const declared = (file as File).type
const spec = ALLOWED[declared as keyof typeof ALLOWED]
if (!spec) {
  return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
}

const arrayBuffer = await (file as Blob).arrayBuffer()
const bytes = new Uint8Array(arrayBuffer)
const offset = declared === 'video/mp4' ? 4 : 0
const magicOk = spec.magic.some((sig) => sig.every((b, i) => bytes[offset + i] === b))
if (!magicOk) {
  return NextResponse.json({ error: 'File content does not match its type' }, { status: 415 })
}

const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/\.\.+/g, '') || 'uploads'
const path = `${safeFolder}/${crypto.randomUUID()}.${spec.ext}`
```

Then in the existing `.upload(path, arrayBuffer, { ... })` call, set `contentType: declared` (the now-validated type) and keep `upsert: false`. Reuse the `arrayBuffer` already read above (remove any duplicate read).

- [ ] **Step 2: Verify**

Run: `npm run build`
Manual: upload a real JPG/PNG via the gallery — succeeds with a UUID filename. Rename a `.txt` to `.png` and upload → expect 415 "File content does not match its type".

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/media/upload/route.ts
git commit -m "fix(security): validate upload type+magic bytes, randomize filenames"
```

> Follow-up (optional, P2): move the media bucket to **private** and serve via signed URLs if any uploaded media is non-public.

---

### Task 7: Add rate limiting to `/api/availability`

**Files:**
- Modify: `app/api/availability/route.ts`

- [ ] **Step 1: Add the shared limiter at the top of the handler**

```ts
import { clientIp, isRateLimited } from '@/lib/rate-limit'
// inside the GET handler, first lines:
if (await isRateLimited(`rl:availability:${clientIp(request)}`, 60, 3600)) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
}
```

- [ ] **Step 2: Verify** — `npm run build`; 61 rapid requests from one IP → 429.

- [ ] **Step 3: Commit**

```bash
git add app/api/availability/route.ts
git commit -m "feat(security): rate-limit public availability endpoint"
```

---

### Task 8: Require a secret token on iCal export

**Files:**
- Modify: `app/api/ical/export/route.ts`
- Modify: `.env.example`

- [ ] **Step 1: Gate the export on a token**

At the top of the `GET` handler:

```ts
const token = request.nextUrl.searchParams.get('token')
if (!process.env.ICAL_EXPORT_TOKEN || token !== process.env.ICAL_EXPORT_TOKEN) {
  return new Response('Not found', { status: 404 })
}
```

- [ ] **Step 2: Document the env var** — add `ICAL_EXPORT_TOKEN=` under a new `# iCal` section in `.env.example`. Generate a value with `openssl rand -base64 32` and set it in `.env.local` + Vercel. Update the OTA-facing feed URL to include `?token=...&room_id=...`.

- [ ] **Step 3: Verify** — `npm run build`; `curl /api/ical/export` (no token) → 404; with token → `.ics` body.

- [ ] **Step 4: Commit**

```bash
git add app/api/ical/export/route.ts .env.example
git commit -m "feat(security): require secret token for iCal export feed"
```

---

### Task 9: Email/phone gate on public booking-status lookup

**Files:**
- Modify: `app/(pages)/booking/status/page.tsx`

- [ ] **Step 1: Require a `verify` param (last 4 of phone or full email) matching the booking**

After the row is fetched, only expose it when the visitor proves they own it:

```tsx
type Props = {
  searchParams: Promise<{ gateway?: string; order_id?: string; status?: string; verify?: string }>
}
// ...
if (row) {
  const v = (params.verify || '').trim().toLowerCase()
  const phoneLast4 = (row.guest_phone || '').slice(-4)
  const ownsIt = v.length > 0 && (v === (row.guest_email || '').toLowerCase() || v === phoneLast4)
  if (ownsIt) {
    booking = row
    const [room] = await db.select().from(rooms).where(eq(rooms.id, row.room_id)).limit(1)
    if (room) roomName = room.name
  }
}
```

When `booking` is null but `order_id` is present, render a small form prompting for email or last-4 phone (POSTs back as `?order_id=...&verify=...`). Keep `robots: { index: false }`.

- [ ] **Step 2: Verify** — `npm run build`; visiting `?order_id=X` alone shows the verify prompt, not PII; correct `verify` reveals status.

- [ ] **Step 3: Commit**

```bash
git add "app/(pages)/booking/status/page.tsx"
git commit -m "fix(security): require ownership proof for booking-status lookup"
```

---

### Task 10: Origin check for state-changing admin requests (CSRF defense-in-depth)

**Files:**
- Modify: `lib/api-handler.ts`

- [ ] **Step 1: Reject cross-origin mutations**

Insert, immediately after the session check (step 1) in `apiHandler`:

```ts
// 1b. CSRF: same-origin enforcement for state-changing methods
if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 })
  }
}
```

- [ ] **Step 2: Verify** — `npm run build`; admin mutations from the app still work; a `curl -X POST` with `-H "Origin: https://evil.com"` to any `/api/admin/*` route → 403.

- [ ] **Step 3: Commit**

```bash
git add lib/api-handler.ts
git commit -m "feat(security): same-origin check on admin mutations (CSRF)"
```

---

### Task 11: Payment amount cross-check on confirmation

**Files:**
- Modify: `lib/payments/common.ts`
- Modify: `app/api/payments/webhooks/razorpay/route.ts`, `.../cashfree/route.ts`, `.../phonepe/route.ts`, `app/api/payments/callbacks/payu/route.ts`, `.../ccavenue/route.ts`

- [ ] **Step 1: Add an optional `paid_amount_inr` to `confirmBookingPayment` and assert it**

In `lib/payments/common.ts`, extend the options type and add the check after the booking is loaded and before the `update`:

```ts
export async function confirmBookingPayment(opts: {
  gateway_order_id: string
  gateway_payment_id: string
  gateway_name: string
  paid_amount_inr?: number // captured amount in rupees
}) {
  // ...existing lookup...
  if (booking.payment_status === 'paid') return booking

  if (opts.paid_amount_inr != null && Math.round(opts.paid_amount_inr) !== Math.round(booking.total_amount || 0)) {
    console.error(
      `[payments] AMOUNT MISMATCH order=${opts.gateway_order_id} expected=${booking.total_amount} got=${opts.paid_amount_inr}`,
    )
    await db.update(bookings).set({ payment_status: 'failed' }).where(eq(bookings.id, booking.id))
    return null
  }
  // ...existing update to paid/confirmed...
```

- [ ] **Step 2: Pass the captured amount from each gateway (amounts are in the smallest unit → convert to rupees)**

- Razorpay webhook: `paid_amount_inr: event.payload.payment.entity.amount / 100`
- PhonePe webhook: `paid_amount_inr: <amount-field> / 100`
- Cashfree webhook: `paid_amount_inr: Number(<order_amount or payment_amount>)` (already rupees)
- PayU callback: `paid_amount_inr: Number(amount)` (rupees)
- CCAvenue callback: `paid_amount_inr: Number(<amount from decrypted response>)` (rupees)

Add the field to each existing `confirmBookingPayment({...})` call. Confirm the exact field name per gateway against the payload shape already parsed in each handler.

- [ ] **Step 3: Verify** — `npm run build`. If you have gateway sandboxes, run a test payment and confirm a matching amount still confirms; a forced mismatch logs `AMOUNT MISMATCH` and marks the booking failed.

- [ ] **Step 4: Commit**

```bash
git add lib/payments/common.ts app/api/payments/webhooks app/api/payments/callbacks
git commit -m "feat(security): cross-check captured payment amount on confirmation"
```

---

### Task 12: CI/CD security pipeline

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`

- [ ] **Step 1: CI workflow (lint + build + audit + CodeQL)**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
permissions:
  contents: read
  security-events: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          # Build must not require real secrets — lazy init covers this.
          DATABASE_URI: postgres://user:pass@localhost:5432/db
      - run: npm audit --audit-level=high
  codeql:
    runs-on: ubuntu-latest
    permissions: { security-events: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript-typescript }
      - uses: github/codeql-action/analyze@v3
```

- [ ] **Step 2: Dependabot**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
```

- [ ] **Step 3: Repo settings (manual, document in `SECURITY.md` Task 18)** — enable GitHub **secret scanning + push protection**, require the `build` check + 1 review to merge to `main`, and disallow force-push to `main`.

- [ ] **Step 4: Verify** — `npx yamllint .github/**/*.yml` (or visual check); push the branch and confirm the Actions run is green.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml .github/dependabot.yml
git commit -m "ci(security): add lint/build/audit/CodeQL pipeline + dependabot"
```

---

# PHASE 2 — Long-Term (Hardening & Enterprise Readiness)

### Task 13: Restricted runtime DB role + TLS

**Files:**
- Create: `db/migrations/9998_app_runtime_role.sql`
- Modify: `.env.local` / Vercel `DATABASE_URI` (operational)

- [ ] **Step 1: Create a least-privilege role**

```sql
-- db/migrations/9998_app_runtime_role.sql
-- Run as the project owner. Replace <STRONG_PASSWORD>.
CREATE ROLE app_runtime LOGIN PASSWORD '<STRONG_PASSWORD>';
GRANT USAGE ON SCHEMA public TO app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_runtime;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_runtime;
```

> Note: `app_runtime` is **not** the table owner, so `FORCE ROW LEVEL SECURITY` from Task 3 will apply to it. Either keep the app on the owner connection, **or** add permissive policies for `app_runtime` (e.g. `CREATE POLICY app_all ON <table> TO app_runtime USING (true) WITH CHECK (true);`). Decide per security appetite; document the choice.

- [ ] **Step 2: Switch `DATABASE_URI`** to the `app_runtime` user and append `?sslmode=require`. Apply via `scripts/apply-sql.ts`, update env, redeploy.

- [ ] **Step 3: Verify** — `npm run build` + full admin smoke test (read + write). Commit the migration (never the password).

```bash
git add db/migrations/9998_app_runtime_role.sql
git commit -m "feat(security): least-privilege runtime DB role + sslmode=require"
```

---

### Task 14: Encrypt stored gateway secrets + redact audit diffs + sign-out-all

**Files:**
- Create: `lib/crypto.ts`
- Modify: payment-config read/write (`lib/payments/resolve-gateway.ts` + the settings/payment API route)
- Modify: `lib/audit.ts` (redaction)
- Modify: `lib/admin-users.ts` (revoke sessions)

- [ ] **Step 1: AES-256-GCM helpers (key from `ENCRYPTION_KEY`, 32 bytes base64)**

```ts
// lib/crypto.ts
import crypto from 'node:crypto'

function key(): Buffer {
  const k = process.env.ENCRYPTION_KEY
  if (!k) throw new Error('ENCRYPTION_KEY not set')
  return Buffer.from(k, 'base64')
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`
}

export function decryptSecret(blob: string): string {
  const [v, ivB, tagB, dataB] = blob.split(':')
  if (v !== 'v1') return blob // tolerate legacy plaintext during migration
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]).toString('utf8')
}
```

- [ ] **Step 2:** Generate `ENCRYPTION_KEY` (`openssl rand -base64 32`), add to `.env.example` + Vercel. Encrypt gateway secret fields on write (settings/payment route) and decrypt in `resolveActiveGateway()`. Provide a one-off `scripts/encrypt-payment-config.ts` to migrate existing rows.

- [ ] **Step 3:** In `lib/audit.ts`, redact known secret keys (`*_secret`, `*_key`, `*_password`, `working_key`, `salt`) from `old_value`/`new_value` before insert.

- [ ] **Step 4 (Low / optional):** add `signOutAllSessions(authId)` to `lib/admin-users.ts` and call it from the deactivate/role-change path for a hard guarantee (note: per-request `getSession()` already enforces `is_active`/`role`).

```ts
export async function signOutAllSessions(authId: string): Promise<void> {
  const admin = getAdminClient()
  try { await admin.auth.admin.signOut(authId, 'global') } catch { /* best-effort */ }
}
```

- [ ] **Step 5: Verify** — `npm run build`; save a payment config, confirm the DB value is `v1:...` ciphertext, confirm checkout still resolves the gateway, confirm audit rows show `[REDACTED]` for secrets.

- [ ] **Step 6: Commit**

```bash
git add lib/crypto.ts lib/audit.ts lib/admin-users.ts lib/payments/resolve-gateway.ts
git commit -m "feat(security): encrypt gateway secrets, redact audit diffs, sign-out-all"
```

---

### Task 15: Observability — error monitoring + auth-event logging

**Files:**
- Create: `sentry.client.config.ts`, `sentry.server.config.ts`, `instrumentation.ts`
- Modify: `app/api/auth/login/route.ts`, logout handler, `lib/audit.ts`

- [ ] **Step 1: Add Sentry** — `npm i @sentry/nextjs`, run `npx @sentry/wizard@latest -i nextjs` (or hand-create configs with `Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })`). Add `SENTRY_DSN` to env. Set up an alert rule for error-rate spikes.

- [ ] **Step 2: Log auth events to `audit_log`** — on login success/failure (Task 4 route) and logout, call `logAudit({ user_id, action: 'auth.login' | 'auth.login_failed' | 'auth.logout', entity_type: 'auth' })`. Failed logins log the attempted email in `new_value` (not the password).

- [ ] **Step 3: Verify** — `npm run build`; trigger a handled error → appears in Sentry; a login + a failed login → two `audit_log` rows.

- [ ] **Step 4: Commit**

```bash
git add sentry.*.config.ts instrumentation.ts app/api/auth lib/audit.ts package.json package-lock.json
git commit -m "feat(security): Sentry error monitoring + auth-event audit logging"
```

---

### Task 16: Strong password policy + self-serve reset

**Files:**
- Modify: `lib/schemas/users.ts`
- Create: `app/api/auth/forgot-password/route.ts`, `app/(admin)/reset-password/page.tsx`

- [ ] **Step 1: Strengthen the password Zod rule** (apply to both create and password-reset schemas)

```ts
export const strongPassword = z
  .string()
  .min(12, 'Use at least 12 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol')
```

Replace the existing `min(8)` password fields with `strongPassword`.

- [ ] **Step 2: Forgot-password route** — rate-limited (`rl:forgot:${ip}`, 5/hour), calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: <site>/reset-password })`. **Always return 200** regardless of whether the email exists (no account enumeration).

- [ ] **Step 3: Reset-password page** — reads the recovery session and calls `supabase.auth.updateUser({ password })`, validating with `strongPassword`. Add a "Forgot password?" link on the login page.

- [ ] **Step 4: Verify** — `npm run build`; weak password rejected with the specific message; reset email flow updates the password end-to-end.

- [ ] **Step 5: Commit**

```bash
git add lib/schemas/users.ts app/api/auth/forgot-password "app/(admin)/reset-password"
git commit -m "feat(security): strong password policy + self-serve reset (no enumeration)"
```

---

### Task 17: Opt-in MFA (TOTP)

**Files:**
- Create: `components/admin/settings/mfa-card.tsx`
- Create: `app/api/auth/mfa/route.ts` (optional helper; Supabase MFA is mostly client-side)

- [ ] **Step 1: MFA settings card** — using the browser Supabase client: `supabase.auth.mfa.enroll({ factorType: 'totp' })` → render the returned QR/secret → `supabase.auth.mfa.challenge` + `verify` to confirm. List/unenroll existing factors. Surface this on the user's own settings page (opt-in, not enforced).

- [ ] **Step 2:** Leave `aal` enforcement off (opt-in decision). Document that raising the assurance level later (Task path to 9/10) requires checking `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` in `getSession()`.

- [ ] **Step 3: Verify** — `npm run build`; a user can enroll TOTP, see it listed, and unenroll.

- [ ] **Step 4: Commit**

```bash
git add components/admin/settings/mfa-card.tsx app/api/auth/mfa
git commit -m "feat(security): opt-in TOTP MFA enrollment"
```

---

### Task 18: Compliance & pen-test readiness docs

**Files:**
- Create: `SECURITY.md`, `docs/security/data-retention.md`, `docs/security/incident-response.md`, `docs/security/privacy-controls.md`, `public/.well-known/security.txt`

- [ ] **Step 1: `SECURITY.md`** — supported versions, how to report a vulnerability (contact), the repo-settings checklist from Task 12 Step 3, and the env-var inventory (names only).

- [ ] **Step 2: `data-retention.md`** — retention windows for bookings/inquiries/audit logs + a periodic purge job design (QStash cron deleting inquiries older than N months). `privacy-controls.md` — what PII is stored, lawful basis, data-subject deletion procedure. `incident-response.md` — detection (Sentry alerts), key-rotation runbook, containment steps, comms.

- [ ] **Step 3: `public/.well-known/security.txt`**

```
Contact: mailto:security@madhubangarden.com
Expires: 2027-06-17T00:00:00.000Z
Preferred-Languages: en
```

- [ ] **Step 4: Commit**

```bash
git add SECURITY.md docs/security public/.well-known/security.txt
git commit -m "docs(security): compliance, retention, privacy, IR runbook, security.txt"
```

---

## Self-review (coverage vs. audit)

| Audit finding | Task |
|---|---|
| #1 front-desk unauth PII leak | Task 2 |
| #2 anon/RLS exposure | Task 3 |
| #3 no security headers/CSP | Task 1 |
| #4 login brute-force/lockout | Task 4 |
| #5 MFA | Task 17 (opt-in per decision) |
| #6 CI/CD security | Task 12 |
| #7 payment amount cross-check | Task 11 |
| #8 upload hardening | Task 6 |
| #9 email injection | Task 5 |
| #10 session revocation | Task 14 Step 4 (Low; per-request enforcement already exists) |
| Rate-limit gaps (availability/iCal) | Tasks 7, 8 |
| Account enumeration (booking-status, reset) | Tasks 9, 16 |
| CSRF | Task 10 |
| DB least privilege / TLS | Task 13 |
| Sensitive-data encryption / audit redaction | Task 14 |
| Observability / auth logging | Task 15 |
| Password policy / self-serve reset | Task 16 |
| Compliance / pen-test readiness | Task 18 |

## Path to 9/10 after this plan
Flip CSP from Report-Only to enforced (Task 1 Step 4), enforce MFA `aal2` for admins (extend Task 17), keep the app on the owner connection **or** finish `app_runtime` policies (Task 13), require green CI + review on `main` (Task 12 Step 3), and commission an external penetration test (Task 18).
