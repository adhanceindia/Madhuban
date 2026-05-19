# Phase 1: Foundation — Remove Payload, Set Up Drizzle + Auth + Admin Shell

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip Payload CMS from the project, replace with Drizzle ORM for data access, Supabase Auth for authentication, and build the custom admin panel shell (sidebar, header, layout) — producing a working `/admin` route with a functional dashboard.

**Architecture:** Same Next.js 15 App Router project. Public pages remain untouched (except `lib/data.ts` which switches from Payload Local API to Drizzle queries). Admin panel lives in `app/(admin)/` route group with custom layout. Supabase Auth handles staff login with middleware protection.

**Tech Stack:** Next.js 15, Drizzle ORM, postgres.js, Supabase Auth (@supabase/ssr), shadcn/ui, TanStack Table, Recharts, Tailwind CSS 3.4

---

## File Map

### New Files
```
db/
├── schema/
│   ├── rooms.ts              ← Drizzle table definition
│   ├── bookings.ts
│   ├── inquiries.ts
│   ├── blocked-dates.ts
│   ├── gallery.ts
│   ├── reviews.ts
│   ├── media.ts
│   ├── users.ts
│   ├── site-content.ts
│   ├── payment-config.ts
│   ├── audit-log.ts
│   └── index.ts              ← Re-exports
├── client.ts                  ← Drizzle singleton
└── queries/
    ├── rooms.ts               ← Room query helpers
    ├── bookings.ts            ← Booking query helpers
    ├── dashboard.ts           ← Dashboard aggregation queries
    └── content.ts             ← Site content queries

lib/
├── supabase/
│   ├── server.ts             ← createServerClient helper
│   └── client.ts             ← createBrowserClient helper
├── auth.ts                    ← Session + role helpers
└── audit.ts                   ← Audit log helper

app/(admin)/
├── login/
│   └── page.tsx              ← Login form
├── admin/
│   ├── layout.tsx            ← Admin shell (sidebar + header)
│   └── page.tsx              ← Dashboard

components/admin/
├── layout/
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── user-menu.tsx
├── dashboard/
│   ├── kpi-cards.tsx
│   ├── occupancy-calendar.tsx
│   ├── recent-bookings.tsx
│   └── revenue-chart.tsx
└── shared/
    ├── status-badge.tsx
    └── empty-state.tsx

middleware.ts                  ← Auth guard for /admin/*
drizzle.config.ts             ← Drizzle Kit config
```

### Files to Delete
```
payload.config.ts
payload-types.ts
collections/                   ← Entire directory
globals/                       ← Entire directory
app/(payload)/                 ← Entire directory
components/admin/Nav.tsx
components/admin/NavClient.tsx
components/admin/DashboardMetrics.tsx
components/admin/StarRatingCell.tsx
components/admin/ViewOnSiteLink.tsx
components/admin/PhoneLinkCell.tsx
components/admin/StatusBadgeCell.tsx
components/admin/cells/
components/admin/fields/
components/admin/views/
src/access/                    ← Entire directory
```

### Files to Modify
```
package.json                   ← Remove Payload deps, add Drizzle + Supabase
next.config.mjs                ← Remove withPayload wrapper
lib/data.ts                    ← Rewrite to use Drizzle instead of Payload Local API
lib/types.ts                   ← Keep as-is (already framework-agnostic)
lib/payments/resolve-gateway.ts ← Rewrite to use Drizzle instead of Payload
app/api/bookings/route.ts      ← Rewrite to use Drizzle
app/api/payments/order/route.ts ← Rewrite to use Drizzle
app/api/availability/route.ts   ← Rewrite to use Drizzle
app/api/dashboard/route.ts      ← Rewrite to use Drizzle
app/api/front-desk/route.ts     ← Rewrite to use Drizzle
app/api/inquiry/route.ts        ← Rewrite to use Drizzle
app/api/cron/sync-ical/route.ts ← Rewrite to use Drizzle
app/api/ical/export/route.ts    ← Rewrite to use Drizzle
app/layout.tsx                   ← Remove Payload font/script injections if any
tailwind.config.ts               ← No changes needed (already correct)
```

---

## Task 1: Remove Payload Dependencies and Clean Up

**Files:**
- Delete: `payload.config.ts`, `payload-types.ts`, `collections/`, `globals/`, `app/(payload)/`, `src/access/`, `components/admin/Nav.tsx`, `components/admin/NavClient.tsx`, `components/admin/DashboardMetrics.tsx`, `components/admin/StarRatingCell.tsx`, `components/admin/ViewOnSiteLink.tsx`, `components/admin/PhoneLinkCell.tsx`, `components/admin/StatusBadgeCell.tsx`, `components/admin/cells/`, `components/admin/fields/`, `components/admin/views/`
- Modify: `package.json`, `next.config.mjs`, `app/layout.tsx`

- [ ] **Step 1: Remove Payload packages from package.json**

Remove these from `dependencies`:
```
@payloadcms/db-postgres
@payloadcms/next
@payloadcms/richtext-lexical
@payloadcms/storage-s3
@payloadcms/ui
payload
graphql
```

Add these to `dependencies`:
```json
"drizzle-orm": "^0.39.0",
"postgres": "^3.4.5",
"@supabase/supabase-js": "^2.49.0",
"@supabase/ssr": "^0.6.0",
"@tanstack/react-table": "^8.21.0",
"recharts": "^2.15.0",
"zod": "^3.24.0"
```

Add to `devDependencies`:
```json
"drizzle-kit": "^0.30.0"
```

Update the `build` script:
```json
"build": "next build",
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 2: Simplify next.config.mjs**

Replace entire file with:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Delete all Payload files**

```bash
rm -rf payload.config.ts payload-types.ts collections/ globals/ app/\(payload\)/ src/access/
rm -f components/admin/Nav.tsx components/admin/NavClient.tsx components/admin/DashboardMetrics.tsx
rm -f components/admin/StarRatingCell.tsx components/admin/ViewOnSiteLink.tsx
rm -f components/admin/PhoneLinkCell.tsx components/admin/StatusBadgeCell.tsx
rm -rf components/admin/cells/ components/admin/fields/ components/admin/views/
```

- [ ] **Step 4: Clean app/layout.tsx if it imports Payload**

Check `app/layout.tsx` — if it imports anything from Payload or `@payload-config`, remove those imports. The public layout should only import fonts and global CSS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Payload CMS completely

Strip all Payload dependencies, config, collections, globals,
admin views, and custom components. Project is temporarily
non-functional until Drizzle schema is set up."
```

---

## Task 2: Set Up Drizzle ORM Schema

**Files:**
- Create: `db/schema/rooms.ts`, `db/schema/bookings.ts`, `db/schema/inquiries.ts`, `db/schema/blocked-dates.ts`, `db/schema/gallery.ts`, `db/schema/reviews.ts`, `db/schema/media.ts`, `db/schema/users.ts`, `db/schema/site-content.ts`, `db/schema/payment-config.ts`, `db/schema/audit-log.ts`, `db/schema/index.ts`, `db/client.ts`, `drizzle.config.ts`

- [ ] **Step 1: Create drizzle.config.ts at project root**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URI!,
  },
})
```

- [ ] **Step 2: Create db/client.ts**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.ts'

let _client: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    _client = postgres(process.env.DATABASE_URI!, { max: 10 })
    _db = drizzle(_client, { schema })
  }
  return _db
}
```

- [ ] **Step 3: Create db/schema/users.ts**

```typescript
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  auth_id: text('auth_id').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', {
    enum: ['super_admin', 'resort_manager', 'front_desk', 'event_manager', 'accountant', 'content_manager'],
  }).notNull().default('front_desk'),
  is_active: boolean('is_active').notNull().default(true),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = User['role']
```

- [ ] **Step 4: Create db/schema/rooms.ts**

```typescript
import { pgTable, serial, text, integer, boolean, numeric, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['standard', 'deluxe', 'suite'] }).notNull(),
  price_per_night: integer('price_per_night').notNull(),
  capacity: integer('capacity').notNull().default(2),
  bed_type: text('bed_type'),
  room_size: text('room_size'),
  description: text('description'),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  images: jsonb('images').$type<string[]>().default([]),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
```

- [ ] **Step 5: Create db/schema/bookings.ts**

```typescript
import { pgTable, serial, text, integer, timestamp, date } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  room_id: integer('room_id').notNull().references(() => rooms.id),
  guest_name: text('guest_name').notNull(),
  guest_phone: text('guest_phone').notNull(),
  guest_email: text('guest_email').notNull(),
  check_in: date('check_in').notNull(),
  check_out: date('check_out').notNull(),
  guests_count: integer('guests_count').notNull().default(1),
  total_amount: integer('total_amount'),
  payment_method: text('payment_method', { enum: ['online', 'at_reception'] }).notNull(),
  payment_status: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  status: text('status', { enum: ['confirmed', 'pending', 'cancelled'] }).notNull().default('pending'),
  source: text('source', { enum: ['website', 'booking_com', 'mmt', 'manual'] }).notNull().default('website'),
  gateway_used: text('gateway_used', { enum: ['razorpay', 'phonepe', 'cashfree', 'ccavenue', 'payu'] }),
  gateway_order_id: text('gateway_order_id'),
  gateway_payment_id: text('gateway_payment_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
```

- [ ] **Step 6: Create db/schema/inquiries.ts**

```typescript
import { pgTable, serial, text, integer, date, timestamp } from 'drizzle-orm/pg-core'

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  event_type: text('event_type', { enum: ['wedding', 'birthday', 'corporate', 'other'] }).notNull(),
  event_date: date('event_date'),
  guests_count: integer('guests_count'),
  message: text('message'),
  status: text('status', { enum: ['new', 'contacted', 'closed'] }).notNull().default('new'),
  staff_notes: text('staff_notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Inquiry = typeof inquiries.$inferSelect
export type NewInquiry = typeof inquiries.$inferInsert
```

- [ ] **Step 7: Create db/schema/blocked-dates.ts**

```typescript
import { pgTable, serial, integer, date, text, timestamp } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'

export const blockedDates = pgTable('blocked_dates', {
  id: serial('id').primaryKey(),
  room_id: integer('room_id').notNull().references(() => rooms.id),
  date: date('date').notNull(),
  source: text('source', { enum: ['ical', 'manual'] }).notNull().default('manual'),
  ical_uid: text('ical_uid'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BlockedDate = typeof blockedDates.$inferSelect
export type NewBlockedDate = typeof blockedDates.$inferInsert
```

- [ ] **Step 8: Create db/schema/gallery.ts**

```typescript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  media_url: text('media_url').notNull(),
  media_type: text('media_type', { enum: ['image', 'video'] }).notNull().default('image'),
  caption: text('caption'),
  category: text('category', { enum: ['rooms', 'wedding', 'events', 'pool', 'restaurant'] }).notNull(),
  sort_order: integer('sort_order').notNull().default(0),
  album: text('album'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GalleryItem = typeof gallery.$inferSelect
export type NewGalleryItem = typeof gallery.$inferInsert
```

- [ ] **Step 9: Create db/schema/reviews.ts**

```typescript
import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  guest_name: text('guest_name').notNull(),
  rating: integer('rating').notNull(),
  review_text: text('review_text').notNull(),
  source: text('source', { enum: ['google', 'manual'] }).notNull().default('manual'),
  is_published: boolean('is_published').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
```

- [ ] **Step 10: Create db/schema/media.ts**

```typescript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  alt: text('alt').notNull().default(''),
  mime_type: text('mime_type').notNull(),
  size: integer('size'),
  width: integer('width'),
  height: integer('height'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type MediaFile = typeof media.$inferSelect
export type NewMediaFile = typeof media.$inferInsert
```

- [ ] **Step 11: Create db/schema/site-content.ts**

```typescript
import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const siteContent = pgTable('site_content', {
  id: serial('id').primaryKey(),
  page: text('page').notNull().unique(),
  content: jsonb('content').notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SiteContentRow = typeof siteContent.$inferSelect
export type NewSiteContentRow = typeof siteContent.$inferInsert
```

- [ ] **Step 12: Create db/schema/payment-config.ts**

```typescript
import { pgTable, serial, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const paymentConfig = pgTable('payment_config', {
  id: serial('id').primaryKey(),
  active_gateway: text('active_gateway', { enum: ['razorpay', 'phonepe', 'cashfree', 'ccavenue', 'payu'] }).notNull().default('razorpay'),
  gateways: jsonb('gateways').notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PaymentConfigRow = typeof paymentConfig.$inferSelect
```

- [ ] **Step 13: Create db/schema/audit-log.ts**

```typescript
import { pgTable, serial, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entity_type: text('entity_type').notNull(),
  entity_id: text('entity_id'),
  old_value: jsonb('old_value'),
  new_value: jsonb('new_value'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AuditLogEntry = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
```

- [ ] **Step 14: Create db/schema/index.ts**

```typescript
export { users } from './users.ts'
export { rooms } from './rooms.ts'
export { bookings } from './bookings.ts'
export { inquiries } from './inquiries.ts'
export { blockedDates } from './blocked-dates.ts'
export { gallery } from './gallery.ts'
export { reviews } from './reviews.ts'
export { media } from './media.ts'
export { siteContent } from './site-content.ts'
export { paymentConfig } from './payment-config.ts'
export { auditLog } from './audit-log.ts'
```

- [ ] **Step 15: Install dependencies and generate migration**

```bash
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr @tanstack/react-table recharts zod
npm install -D drizzle-kit
npx drizzle-kit generate
```

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "feat: add Drizzle ORM schema for all tables

Define 11 tables: users, rooms, bookings, inquiries, blocked_dates,
gallery, reviews, media, site_content, payment_config, audit_log.
Includes drizzle.config.ts and lazy client singleton."
```

---

## Task 3: Set Up Supabase Auth

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/auth.ts`, `middleware.ts`

- [ ] **Step 1: Create lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — can't set cookies
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 3: Create lib/auth.ts**

```typescript
import { createSupabaseServerClient } from './supabase/server.ts'
import { getDb } from '@/db/client.ts'
import { users } from '@/db/schema/users.ts'
import { eq } from 'drizzle-orm'
import type { User, UserRole } from '@/db/schema/users.ts'

export type SessionUser = {
  id: number
  auth_id: string
  name: string
  email: string
  role: UserRole
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) return null

  const db = getDb()
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.auth_id, authUser.id))
    .limit(1)

  if (!dbUser || !dbUser.is_active) return null

  return {
    id: dbUser.id,
    auth_id: dbUser.auth_id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  }
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccess(userRole: UserRole, module: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    dashboard: ['super_admin', 'resort_manager', 'front_desk', 'event_manager', 'accountant', 'content_manager'],
    bookings: ['super_admin', 'resort_manager', 'front_desk', 'accountant'],
    rooms: ['super_admin', 'resort_manager'],
    'front-desk': ['super_admin', 'resort_manager', 'front_desk'],
    calendar: ['super_admin', 'resort_manager', 'front_desk'],
    'channel-manager': ['super_admin', 'resort_manager'],
    gallery: ['super_admin', 'resort_manager', 'event_manager', 'content_manager'],
    reviews: ['super_admin', 'resort_manager', 'event_manager', 'content_manager'],
    inquiries: ['super_admin', 'resort_manager', 'front_desk', 'event_manager'],
    content: ['super_admin', 'resort_manager', 'content_manager'],
    analytics: ['super_admin', 'resort_manager', 'accountant'],
    'audit-log': ['super_admin'],
    users: ['super_admin'],
    settings: ['super_admin'],
  }

  const allowed = permissions[module]
  if (!allowed) return false
  return allowed.includes(userRole)
}
```

- [ ] **Step 4: Create middleware.ts at project root**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isLoginPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Supabase Auth with middleware protection

Set up server/client Supabase helpers, session/role utilities,
and middleware that redirects unauthenticated users from /admin
to /login."
```

---

## Task 4: Build Login Page

**Files:**
- Create: `app/(admin)/login/page.tsx`

- [ ] **Step 1: Create app/(admin)/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    const redirect = searchParams.get('redirect') || '/admin'
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground font-display">
            Madhuban Garden
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Staff Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@madhubangarden.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add staff login page at /login"
```

---

## Task 5: Build Admin Shell Layout (Sidebar + Header)

**Files:**
- Create: `components/admin/layout/sidebar.tsx`, `components/admin/layout/header.tsx`, `components/admin/layout/user-menu.tsx`, `app/(admin)/admin/layout.tsx`

- [ ] **Step 1: Create components/admin/layout/sidebar.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  ClipboardList,
  ConciergeBell,
  Radio,
  Image,
  Star,
  Inbox,
  FileText,
  BarChart3,
  ScrollText,
  Users,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/db/schema/users'
import { canAccess } from '@/lib/auth'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  module: string
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, module: 'dashboard' },
      { label: 'Bookings', href: '/admin/bookings', icon: <ClipboardList size={20} />, module: 'bookings' },
      { label: 'Front Desk', href: '/admin/front-desk', icon: <ConciergeBell size={20} />, module: 'front-desk' },
      { label: 'Calendar', href: '/admin/calendar', icon: <Calendar size={20} />, module: 'calendar' },
      { label: 'Rooms', href: '/admin/rooms', icon: <BedDouble size={20} />, module: 'rooms' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Gallery', href: '/admin/gallery', icon: <Image size={20} />, module: 'gallery' },
      { label: 'Reviews', href: '/admin/reviews', icon: <Star size={20} />, module: 'reviews' },
      { label: 'Inquiries', href: '/admin/inquiries', icon: <Inbox size={20} />, module: 'inquiries' },
      { label: 'Pages', href: '/admin/content', icon: <FileText size={20} />, module: 'content' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Channel Manager', href: '/admin/channel-manager', icon: <Radio size={20} />, module: 'channel-manager' },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} />, module: 'analytics' },
      { label: 'Audit Log', href: '/admin/audit-log', icon: <ScrollText size={20} />, module: 'audit-log' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users size={20} />, module: 'users' },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={20} />, module: 'settings' },
    ],
  },
]

export function Sidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] h-screen sticky top-0 border-r border-border bg-white flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-foreground text-[15px]">Madhuban</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(userRole, item.module))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mb-6">
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium no-underline transition-colors ${
                        isActive
                          ? 'bg-primary-light text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create components/admin/layout/header.tsx**

```tsx
import type { SessionUser } from '@/lib/auth'
import { UserMenu } from './user-menu'

export function AdminHeader({ user }: { user: SessionUser }) {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div />
      <UserMenu user={user} />
    </header>
  )
}
```

- [ ] **Step 3: Create components/admin/layout/user-menu.tsx**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { SessionUser } from '@/lib/auth'

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors border-none bg-transparent cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-primary font-semibold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-foreground">{user.name}</div>
          <div className="text-[11px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</div>
        </div>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-lg shadow-md py-1 z-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors border-none bg-transparent cursor-pointer text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create app/(admin)/admin/layout.tsx**

```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/admin/layout/sidebar'
import { AdminHeader } from '@/components/admin/layout/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build admin shell layout with sidebar and header

Custom sidebar with role-based nav groups, header with user menu,
and admin layout that checks session and redirects if not logged in."
```

---

## Task 6: Build Dashboard Page

**Files:**
- Create: `db/queries/dashboard.ts`, `app/api/dashboard/route.ts` (rewrite), `components/admin/dashboard/kpi-cards.tsx`, `components/admin/dashboard/occupancy-calendar.tsx`, `components/admin/dashboard/recent-bookings.tsx`, `components/admin/shared/status-badge.tsx`, `components/admin/shared/empty-state.tsx`, `app/(admin)/admin/page.tsx`

- [ ] **Step 1: Create components/admin/shared/status-badge.tsx**

```tsx
const variants: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-violet-50 text-violet-700 border-violet-200',
  closed: 'bg-gray-50 text-gray-600 border-gray-200',
  website: 'bg-blue-50 text-blue-700 border-blue-200',
  booking_com: 'bg-blue-50 text-blue-700 border-blue-200',
  mmt: 'bg-orange-50 text-orange-700 border-orange-200',
  manual: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function StatusBadge({ value }: { value: string }) {
  const cls = variants[value] || 'bg-gray-50 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}
```

- [ ] **Step 2: Create components/admin/shared/empty-state.tsx**

```tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="text-center py-10 px-4">
      <div className="text-muted-foreground/40 mb-3 flex justify-center">{icon}</div>
      <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
      <div className="text-xs text-muted-foreground mb-4">{description}</div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-primary text-white rounded-lg no-underline"
        >
          <Plus size={14} /> {action.label}
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create db/queries/dashboard.ts**

```typescript
import { getDb } from '@/db/client'
import { bookings, rooms, blockedDates, inquiries } from '@/db/schema'
import { eq, and, gte, lte, sql, count, sum, inArray } from 'drizzle-orm'

export async function getDashboardData(startDate: string, endDate: string) {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]

  const allRooms = await db.select().from(rooms).where(eq(rooms.is_active, true))
  const totalRooms = allRooms.length

  const periodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.check_in, startDate),
        lte(bookings.check_in, endDate),
      )
    )

  const todayBookings = periodBookings.filter(
    (b) => b.check_in <= today && b.check_out > today && b.status !== 'cancelled'
  )

  const confirmedBookings = periodBookings.filter((b) => b.status === 'confirmed')
  const pendingBookings = periodBookings.filter((b) => b.status === 'pending')
  const cancelledBookings = periodBookings.filter((b) => b.status === 'cancelled')

  const paidBookings = periodBookings.filter((b) => b.payment_status === 'paid')
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const onlineRevenue = paidBookings
    .filter((b) => b.payment_method === 'online')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const receptionRevenue = totalRevenue - onlineRevenue

  const todayCheckIns = periodBookings.filter(
    (b) => b.check_in === today && b.status !== 'cancelled'
  ).length
  const todayCheckOuts = periodBookings.filter(
    (b) => b.check_out === today && b.status !== 'cancelled'
  ).length

  const pendingInquiries = await db
    .select({ count: count() })
    .from(inquiries)
    .where(eq(inquiries.status, 'new'))

  const recentBookings = periodBookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((b) => {
      const room = allRooms.find((r) => r.id === b.room_id)
      return {
        id: b.id,
        guest_name: b.guest_name,
        room_name: room?.name || 'Unknown',
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount || 0,
        status: b.status,
        payment_status: b.payment_status,
        source: b.source,
      }
    })

  const upcomingCheckIns = periodBookings
    .filter((b) => b.check_in >= today && b.check_in <= addDays(today, 7) && b.status !== 'cancelled')
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 10)
    .map((b) => {
      const room = allRooms.find((r) => r.id === b.room_id)
      return {
        id: b.id,
        guest_name: b.guest_name,
        room_name: room?.name || 'Unknown',
        check_in: b.check_in,
        check_out: b.check_out,
        total_amount: b.total_amount || 0,
        status: b.status,
        payment_status: b.payment_status,
        source: b.source,
      }
    })

  // Week occupancy grid
  const weekDates = Array.from({ length: 14 }, (_, i) => addDays(today, i))
  const weekBlockedDates = await db
    .select()
    .from(blockedDates)
    .where(
      and(
        gte(blockedDates.date, today),
        lte(blockedDates.date, addDays(today, 13)),
      )
    )

  const weekOccupancy = allRooms.map((room) => {
    const days: Record<string, boolean> = {}
    for (const d of weekDates) {
      const isBooked = periodBookings.some(
        (b) => b.room_id === room.id && b.check_in <= d && b.check_out > d && b.status !== 'cancelled'
      )
      const isBlocked = weekBlockedDates.some(
        (bd) => bd.room_id === room.id && bd.date === d
      )
      days[d] = isBooked || isBlocked
    }
    return { room_id: room.id, room_name: room.name, days }
  })

  return {
    today,
    total_rooms: totalRooms,
    booked_rooms_today: todayBookings.length,
    available_rooms_today: totalRooms - todayBookings.length,
    occupancy_rate: totalRooms > 0 ? Math.round((todayBookings.length / totalRooms) * 100) : 0,
    total_revenue: totalRevenue,
    online_revenue: onlineRevenue,
    reception_revenue: receptionRevenue,
    avg_booking_value: paidBookings.length > 0 ? Math.round(totalRevenue / paidBookings.length) : 0,
    total_bookings: periodBookings.length,
    confirmed_bookings: confirmedBookings.length,
    pending_bookings: pendingBookings.length,
    cancelled_bookings: cancelledBookings.length,
    today_check_ins: todayCheckIns,
    today_check_outs: todayCheckOuts,
    pending_inquiries: pendingInquiries[0]?.count || 0,
    week_occupancy: weekOccupancy,
    upcoming_check_ins: upcomingCheckIns,
    recent_bookings: recentBookings,
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
```

- [ ] **Step 4: Rewrite app/api/dashboard/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDashboardData } from '@/db/queries/dashboard'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end params required' }, { status: 400 })
  }

  const data = await getDashboardData(start, end)
  return NextResponse.json(data)
}
```

- [ ] **Step 5: Create components/admin/dashboard/kpi-cards.tsx**

```tsx
'use client'

import { DollarSign, Calendar, Gauge, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

type KPIData = {
  total_revenue: number
  total_bookings: number
  occupancy_rate: number
  booked_rooms_today: number
  total_rooms: number
  confirmed_bookings: number
  pending_bookings: number
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function KPICards({ data }: { data: KPIData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-5 border-t-4 border-t-primary shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center mb-3">
          <DollarSign size={20} className="text-primary" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.total_revenue > 0 ? formatCurrency(data.total_revenue) : '₹0'}
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Total Revenue
        </div>
      </Card>

      <Card className="p-5 border-t-4 border-t-gold shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-gold-light flex items-center justify-center mb-3">
          <Calendar size={20} className="text-gold" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.total_bookings}
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Total Bookings
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {data.confirmed_bookings} confirmed, {data.pending_bookings} pending
        </div>
      </Card>

      <Card className="p-5 border-t-4 border-t-primary shadow-sm">
        <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center mb-3">
          <Gauge size={20} className="text-primary" />
        </div>
        <div className="text-[28px] font-bold text-foreground leading-none font-admin-mono">
          {data.occupancy_rate}%
        </div>
        <div className="text-[12px] font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
          Occupancy Rate
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {data.booked_rooms_today} of {data.total_rooms} rooms occupied today
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Create components/admin/dashboard/occupancy-calendar.tsx**

```tsx
'use client'

import { Card } from '@/components/ui/card'
import { LayoutGrid } from 'lucide-react'
import { EmptyState } from '@/components/admin/shared/empty-state'

type WeekOccupancy = {
  room_id: number
  room_name: string
  days: Record<string, boolean>
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tmrw'
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function getDayNum(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').getDate().toString()
}

export function OccupancyCalendar({ data }: { data: WeekOccupancy[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-5 shadow-sm">
        <EmptyState
          icon={<LayoutGrid size={24} />}
          title="No rooms configured"
          description="Add rooms to see the occupancy calendar"
          action={{ label: 'Add Room', href: '/admin/rooms' }}
        />
      </Card>
    )
  }

  const allDates = Object.keys(data[0].days).sort()

  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid size={18} className="text-violet-600" />
        <span className="text-sm font-semibold text-foreground">Room Availability</span>
        <span className="text-[11px] text-muted-foreground">Next 14 days</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white text-left px-3 py-2 border-b border-border font-semibold text-muted-foreground min-w-[120px]">
                Room
              </th>
              {allDates.map((d) => (
                <th key={d} className="text-center px-1 py-2 border-b border-border">
                  <div className="text-[10px] text-muted-foreground/70 font-medium">{getDayLabel(d)}</div>
                  <div className="font-semibold text-foreground">{getDayNum(d)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((room) => (
              <tr key={room.room_id}>
                <td className="sticky left-0 z-10 bg-white font-medium text-foreground px-3 py-1.5 border-b border-gray-50 text-[12px]">
                  {room.room_name}
                </td>
                {allDates.map((d) => (
                  <td key={d} className="text-center px-1 py-1.5 border-b border-gray-50">
                    <div className={`w-7 h-7 rounded-md mx-auto flex items-center justify-center ${
                      room.days[d]
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        room.days[d] ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-red-500" /> Booked/Blocked
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 7: Create components/admin/dashboard/recent-bookings.tsx**

```tsx
'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Users, Calendar, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { EmptyState } from '@/components/admin/shared/empty-state'

type BookingSummary = {
  id: number
  guest_name: string
  room_name: string
  check_in: string
  check_out: string
  total_amount: number
  status: string
  payment_status: string
  source: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function RecentBookings({ data }: { data: BookingSummary[] }) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <span className="text-sm font-semibold text-foreground">Recent Bookings</span>
        </div>
        <Link href="/admin/bookings" className="flex items-center gap-0.5 text-xs font-medium text-primary no-underline hover:underline">
          View all <ChevronRight size={14} />
        </Link>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={<Calendar size={24} />}
          title="No bookings yet"
          description="Your recent bookings will appear here"
          action={{ label: 'Create Booking', href: '/admin/bookings' }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">
                    <Link href={`/admin/bookings/${b.id}`} className="text-primary font-medium no-underline hover:underline">
                      {b.guest_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{b.room_name}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{formatDate(b.check_in)}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap">{formatDate(b.check_out)}</td>
                  <td className="px-3 py-3 border-b border-muted font-medium font-admin-mono whitespace-nowrap">{formatCurrency(b.total_amount)}</td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.status} /></td>
                  <td className="px-3 py-3 border-b border-muted whitespace-nowrap"><StatusBadge value={b.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
```

- [ ] **Step 8: Create app/(admin)/admin/page.tsx (Dashboard)**

```tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { KPICards } from '@/components/admin/dashboard/kpi-cards'
import { OccupancyCalendar } from '@/components/admin/dashboard/occupancy-calendar'
import { RecentBookings } from '@/components/admin/dashboard/recent-bookings'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDefaultRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: toISO(start), end: toISO(end) }
}

export default function DashboardPage() {
  const defaults = getDefaultRange()
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (start: string, end: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?start=${start}&end=${end}`)
      if (res.ok) setData(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(startDate, endDate) }, [fetchData, startDate, endDate])

  if (loading && !data) {
    return (
      <div className="max-w-[1200px]">
        <Skeleton className="h-6 w-36 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Card key={i} className="p-5 h-[140px]"><Skeleton className="h-full" /></Card>)}
        </div>
        <Card className="p-5 h-[300px]"><Skeleton className="h-full" /></Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground font-display">Dashboard</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-border rounded-lg bg-white"
          />
        </div>
      </div>

      <KPICards data={data} />
      <div className="mb-6">
        <OccupancyCalendar data={data.week_occupancy} />
      </div>
      <RecentBookings data={data.recent_bookings} />
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: build admin dashboard with KPIs, calendar, and bookings table

Dashboard fetches from /api/dashboard (rewritten to use Drizzle),
displays KPI cards, 14-day occupancy calendar grid, and recent
bookings table with status badges."
```

---

## Task 7: Rewrite lib/data.ts to Use Drizzle (Public Pages)

**Files:**
- Modify: `lib/data.ts`
- Create: `db/queries/rooms.ts`, `db/queries/content.ts`

- [ ] **Step 1: Create db/queries/rooms.ts**

```typescript
import { getDb } from '@/db/client'
import { rooms } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Room } from '@/db/schema/rooms'

export async function getActiveRooms(): Promise<Room[]> {
  const db = getDb()
  return db.select().from(rooms).where(eq(rooms.is_active, true)).orderBy(rooms.price_per_night)
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const db = getDb()
  const [room] = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1)
  return room || null
}

export async function getFeaturedRooms(limit = 3): Promise<Room[]> {
  const db = getDb()
  return db
    .select()
    .from(rooms)
    .where(eq(rooms.is_active, true))
    .orderBy(rooms.price_per_night)
    .limit(limit)
}
```

- [ ] **Step 2: Create db/queries/content.ts**

```typescript
import { getDb } from '@/db/client'
import { siteContent } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getPageContent(page: string): Promise<Record<string, any>> {
  const db = getDb()
  const [row] = await db.select().from(siteContent).where(eq(siteContent.page, page)).limit(1)
  return (row?.content as Record<string, any>) || {}
}

export async function getAllSiteContent(): Promise<Record<string, Record<string, any>>> {
  const db = getDb()
  const rows = await db.select().from(siteContent)
  const result: Record<string, Record<string, any>> = {}
  for (const row of rows) {
    result[row.page] = row.content as Record<string, any>
  }
  return result
}
```

- [ ] **Step 3: Rewrite lib/data.ts**

```typescript
import 'server-only'

import { getDb } from '@/db/client'
import { rooms, reviews, gallery, siteContent } from '@/db/schema'
import { eq, asc, desc } from 'drizzle-orm'
import type { SiteContent, RoomData, ReviewData, GalleryItemData, HeroImage } from './types'

const defaultSiteContent: SiteContent = {
  name: 'Madhuban Garden Resort',
  tagline: 'The most peaceful & lush green premises in Agar Malwa District.',
  phone: '+91 73899 09985',
  email: 'hello@madhubangarden.com',
  address: 'Agar Malwa District, Madhya Pradesh, India',
  whatsapp: '+91 73899 09985',
  instagram: 'https://instagram.com/madhubangarden',
  facebook: 'https://facebook.com/madhubangarden',
  hero_heading: 'Madhuban Garden Resort',
  hero_subtext: '',
  wedding_heading: 'Make your wedding unforgettable',
  wedding_description: '',
  hero_images: [],
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const db = getDb()
    const rows = await db.select().from(siteContent)
    const contentMap: Record<string, any> = {}
    for (const row of rows) {
      contentMap[row.page] = row.content
    }

    const general = contentMap['general'] || {}
    const contact = contentMap['contact'] || {}
    const social = contentMap['social'] || {}
    const heroData = contentMap['hero_images'] || {}

    const hero_images: HeroImage[] = Array.isArray(heroData.images)
      ? heroData.images.filter((x: any) => x?.url)
      : []

    return {
      name: 'Madhuban Garden Resort',
      tagline: general.tagline || defaultSiteContent.tagline,
      hero_heading: general.hero_heading || defaultSiteContent.hero_heading,
      hero_subtext: general.hero_subtext || defaultSiteContent.hero_subtext,
      wedding_heading: general.wedding_heading || defaultSiteContent.wedding_heading,
      wedding_description: general.wedding_description || defaultSiteContent.wedding_description,
      phone: contact.phone || defaultSiteContent.phone,
      email: contact.email || defaultSiteContent.email,
      address: contact.address || defaultSiteContent.address,
      whatsapp: contact.whatsapp || defaultSiteContent.whatsapp,
      instagram: social.instagram || defaultSiteContent.instagram,
      facebook: social.facebook || defaultSiteContent.facebook,
      hero_images,
    }
  } catch (error) {
    console.error('[data] getSiteContent error:', error)
    return defaultSiteContent
  }
}

export async function getRooms(): Promise<RoomData[]> {
  try {
    const db = getDb()
    const results = await db.select().from(rooms).where(eq(rooms.is_active, true)).orderBy(asc(rooms.price_per_night))
    return results.map(normalizeRoom)
  } catch (error) {
    console.error('[data] getRooms error:', error)
    return []
  }
}

export async function getRoomBySlug(slug: string): Promise<RoomData | null> {
  try {
    const db = getDb()
    const [room] = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1)
    if (!room) return null
    return normalizeRoom(room)
  } catch (error) {
    console.error('[data] getRoomBySlug error:', error)
    return null
  }
}

export async function getFeaturedRooms(): Promise<RoomData[]> {
  try {
    const db = getDb()
    const results = await db
      .select()
      .from(rooms)
      .where(eq(rooms.is_active, true))
      .orderBy(desc(rooms.price_per_night))
      .limit(3)
    return results.map(normalizeRoom)
  } catch (error) {
    console.error('[data] getFeaturedRooms error:', error)
    return []
  }
}

export async function getRelatedRooms(currentSlug: string, limit = 3): Promise<RoomData[]> {
  const allRooms = await getRooms()
  return allRooms.filter((r) => r.slug !== currentSlug).slice(0, limit)
}

export async function getReviews(): Promise<ReviewData[]> {
  try {
    const db = getDb()
    const results = await db
      .select()
      .from(reviews)
      .where(eq(reviews.is_published, true))
      .orderBy(desc(reviews.created_at))
      .limit(50)
    return results.map((r) => ({
      id: r.id,
      guest_name: r.guest_name,
      rating: r.rating,
      review_text: r.review_text,
      createdAt: r.created_at.toISOString(),
    }))
  } catch (error) {
    console.error('[data] getReviews error:', error)
    return []
  }
}

export async function getGallery(category?: string): Promise<GalleryItemData[]> {
  try {
    const db = getDb()
    let query = db.select().from(gallery).orderBy(asc(gallery.sort_order))

    const results = category && category !== 'all'
      ? await db.select().from(gallery).where(eq(gallery.category, category)).orderBy(asc(gallery.sort_order))
      : await db.select().from(gallery).orderBy(asc(gallery.sort_order))

    return results.map((g) => ({
      id: g.id,
      src: g.media_url,
      alt: g.caption || '',
      caption: g.caption || '',
      category: g.category,
      sort_order: g.sort_order,
    }))
  } catch (error) {
    console.error('[data] getGallery error:', error)
    return []
  }
}

function normalizeRoom(room: typeof rooms.$inferSelect): RoomData {
  return {
    id: room.id,
    slug: room.slug,
    name: room.name,
    type: room.type,
    description: room.description || '',
    price_per_night: room.price_per_night,
    capacity: room.capacity,
    bed_type: room.bed_type || '',
    room_size: room.room_size || '',
    amenities: (room.amenities as string[]) || [],
    images: (room.images as string[]) || [],
    is_active: room.is_active,
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: rewrite lib/data.ts to use Drizzle ORM

Replace all Payload Local API calls with Drizzle queries.
Public pages now read from the same Postgres DB via Drizzle
instead of Payload's internal query engine."
```

---

## Task 8: Rewrite Core API Routes to Use Drizzle

**Files:**
- Modify: `app/api/bookings/route.ts`, `app/api/availability/route.ts`, `app/api/inquiry/route.ts`, `app/api/payments/order/route.ts`, `lib/payments/resolve-gateway.ts`

- [ ] **Step 1: Rewrite app/api/availability/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/db/client'
import { bookings, blockedDates } from '@/db/schema'
import { and, eq, lt, gt, gte, lte, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('room_id')
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')

  if (!roomId || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'room_id, check_in, check_out required' }, { status: 400 })
  }

  const db = getDb()

  const overlapping = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.room_id, parseInt(roomId)),
        inArray(bookings.status, ['confirmed', 'pending']),
        lt(bookings.check_in, checkOut),
        gt(bookings.check_out, checkIn),
      )
    )
    .limit(1)

  const blocked = await db
    .select({ id: blockedDates.id })
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.room_id, parseInt(roomId)),
        gte(blockedDates.date, checkIn),
        lt(blockedDates.date, checkOut),
      )
    )
    .limit(1)

  const available = overlapping.length === 0 && blocked.length === 0

  return NextResponse.json({ available })
}
```

- [ ] **Step 2: Rewrite app/api/bookings/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/db/client'
import { bookings, blockedDates, rooms } from '@/db/schema'
import { and, eq, lt, gt, gte, inArray } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'
import { sendBookingConfirmationEmail } from '@/lib/email'

const bookingSchema = z.object({
  room_id: z.string().min(1),
  guest_name: z.string().min(2),
  guest_phone: z.string().regex(/^[6-9]\d{9}$/),
  guest_email: z.string().email(),
  check_in: z.string().refine((v) => !isNaN(Date.parse(v))),
  check_out: z.string().refine((v) => !isNaN(Date.parse(v))),
  guests_count: z.number().int().min(1),
  payment_method: z.literal('at_reception'),
})

async function isRateLimited(ip: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false
  const key = `rl:bookings:${ip}`
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 3600)
    return count > 10
  } catch { return false }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message, code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const { room_id, guest_name, guest_phone, guest_email, check_in, check_out, guests_count } = parsed.data
    const roomIdNum = parseInt(room_id)
    const db = getDb()

    const overlapping = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.room_id, roomIdNum),
        inArray(bookings.status, ['confirmed', 'pending']),
        lt(bookings.check_in, check_out),
        gt(bookings.check_out, check_in),
      ))
      .limit(1)

    const blocked = await db
      .select({ id: blockedDates.id })
      .from(blockedDates)
      .where(and(
        eq(blockedDates.room_id, roomIdNum),
        gte(blockedDates.date, check_in),
        lt(blockedDates.date, check_out),
      ))
      .limit(1)

    if (overlapping.length > 0 || blocked.length > 0) {
      return NextResponse.json({ error: 'Room not available', code: 'UNAVAILABLE' }, { status: 409 })
    }

    const [room] = await db.select().from(rooms).where(eq(rooms.id, roomIdNum)).limit(1)
    if (!room) {
      return NextResponse.json({ error: 'Room not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const nights = Math.max(1, Math.ceil((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000))
    const subtotal = room.price_per_night * nights
    const gst = Math.round(subtotal * 0.12)
    const totalAmount = subtotal + gst

    const [booking] = await db.insert(bookings).values({
      room_id: roomIdNum,
      guest_name,
      guest_phone,
      guest_email,
      check_in,
      check_out,
      guests_count,
      payment_method: 'at_reception',
      payment_status: 'pending',
      status: 'pending',
      source: 'website',
      total_amount: totalAmount,
    }).returning()

    try {
      await sendBookingConfirmationEmail({
        booking_id: booking.id,
        guest_name,
        guest_email,
        guest_phone,
        room_name: room.name,
        check_in,
        check_out,
        nights,
        subtotal,
        gst,
        total_amount: totalAmount,
        payment_method: 'at_reception',
      })
    } catch (e) {
      console.error('[api/bookings] Email failed:', e)
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      total_amount: totalAmount,
      nights,
      room_name: room.name,
    })
  } catch (error) {
    console.error('[api/bookings] Error:', error)
    return NextResponse.json({ error: 'Something went wrong', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Rewrite lib/payments/resolve-gateway.ts**

```typescript
import { getDb } from '@/db/client'
import { paymentConfig } from '@/db/schema'
import type { GatewayName, PaymentConfigData, PaymentGateway } from './types'
import { RazorpayGateway } from './razorpay'
import { PhonePeGateway } from './phonepe'
import { CashfreeGateway } from './cashfree'
import { CCavenueGateway } from './ccavenue'
import { PayUGateway } from './payu'

export async function getPaymentConfig(): Promise<PaymentConfigData> {
  const db = getDb()
  const [config] = await db.select().from(paymentConfig).limit(1)
  if (!config) throw new Error('Payment config not found. Please configure in admin settings.')
  return {
    active_gateway: config.active_gateway,
    ...(config.gateways as Record<string, unknown>),
  } as PaymentConfigData
}

const REQUIRED_FIELDS: Record<GatewayName, string[]> = {
  razorpay: ['razorpay_key_id', 'razorpay_key_secret'],
  phonepe: ['phonepe_client_id', 'phonepe_client_secret', 'phonepe_client_version'],
  cashfree: ['cashfree_app_id', 'cashfree_secret_key'],
  ccavenue: ['ccavenue_merchant_id', 'ccavenue_access_code', 'ccavenue_working_key'],
  payu: ['payu_merchant_key', 'payu_merchant_salt'],
}

function validateCredentials(gateway: GatewayName, cfg: PaymentConfigData): void {
  const missing = REQUIRED_FIELDS[gateway].filter(
    (field) => !((cfg as unknown as Record<string, unknown>)[field] as string)?.trim(),
  )
  if (missing.length > 0) {
    throw new Error(`Payment gateway "${gateway}" missing credentials: ${missing.join(', ')}`)
  }
}

export async function resolveActiveGateway(): Promise<PaymentGateway> {
  const cfg = await getPaymentConfig()
  const name = cfg.active_gateway

  const enabledKey = `${name}_enabled` as keyof PaymentConfigData
  if (!cfg[enabledKey]) {
    throw new Error(`Payment gateway "${name}" is not enabled.`)
  }

  validateCredentials(name, cfg)

  switch (name) {
    case 'razorpay': return new RazorpayGateway(cfg)
    case 'phonepe': return new PhonePeGateway(cfg)
    case 'cashfree': return new CashfreeGateway(cfg)
    case 'ccavenue': return new CCavenueGateway(cfg)
    case 'payu': return new PayUGateway(cfg)
    default: throw new Error(`Unknown gateway: ${name}`)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: rewrite API routes to use Drizzle ORM

Availability, bookings, and payments/resolve-gateway now use
Drizzle queries. All Payload imports removed from API layer."
```

---

## Task 9: Create Audit Log Helper

**Files:**
- Create: `lib/audit.ts`

- [ ] **Step 1: Create lib/audit.ts**

```typescript
import { getDb } from '@/db/client'
import { auditLog } from '@/db/schema'

type LogAuditParams = {
  user_id: number | null
  action: string
  entity_type: string
  entity_id?: string | number
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
}

export async function logAudit(params: LogAuditParams) {
  try {
    const db = getDb()
    await db.insert(auditLog).values({
      user_id: params.user_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id?.toString(),
      old_value: params.old_value || null,
      new_value: params.new_value || null,
    })
  } catch (error) {
    console.error('[audit] Failed to log:', error)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add audit log helper for tracking admin mutations"
```

---

## Task 10: Install Dependencies and Verify Build

- [ ] **Step 1: Run npm install**

```bash
npm install
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build should succeed. If there are remaining Payload imports in files not yet updated (like `app/api/payments/order/route.ts`, `app/api/cron/sync-ical/route.ts`, etc.), fix them by applying the same pattern — replace `getPayload` + `payload.find()` with `getDb()` + Drizzle queries.

- [ ] **Step 3: Fix any remaining Payload imports**

Search the codebase for any remaining `from 'payload'` or `from '@payload-config'` imports and rewrite them to use Drizzle.

```bash
grep -r "from 'payload'" app/ lib/ --include="*.ts" --include="*.tsx"
grep -r "@payload-config" app/ lib/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 4: Verify build passes clean**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: remove all remaining Payload imports, build passes clean"
```

---

## Summary

After Phase 1, the project will have:
- No Payload CMS dependency
- Drizzle ORM with full schema for all 11 tables
- Supabase Auth with middleware protection
- Custom admin shell (sidebar + header + layout)
- Working dashboard with KPIs, occupancy calendar, recent bookings
- Public pages still working (via rewritten `lib/data.ts`)
- API routes rewritten to use Drizzle
- Audit log helper ready for use

**Next phases:**
- Phase 2: Bookings module (TanStack Table), Rooms CRUD, Calendar view, Front Desk
- Phase 3: Channel Manager, Gallery (drag-reorder + video), Reviews, Inquiries, Content Editor
- Phase 4: Analytics (Recharts), Audit Log view, Users/RBAC management, Settings
