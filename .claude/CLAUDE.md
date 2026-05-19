# CLAUDE.md — Madhuban Garden Resort

> Complete resort management system with custom admin panel.
> Payload CMS has been removed. All data access is via Drizzle ORM + Supabase Postgres.
> Auth is via Supabase Auth. Admin panel is fully custom React (shadcn/ui).

---

## Project Identity

| Field | Value |
|---|---|
| Project | Madhuban Garden Resort |
| Domain | madhubangarden.com |
| Deployment | madhuban-amber.vercel.app |
| Client | Madhuban Garden Resort, Agar Malwa District, MP |
| Agency | Xternal Media |
| Admin Panel | /admin (custom-built) |

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| Database | Supabase PostgreSQL | Primary data store |
| ORM | Drizzle ORM | Type-safe SQL queries |
| Auth | Supabase Auth (@supabase/ssr) | Staff authentication + sessions |
| Admin UI | shadcn/ui + Radix | Component library |
| Data Tables | TanStack Table | Sortable, filterable data grids |
| Charts | Recharts | Analytics and reporting |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| Media Storage | Supabase S3 | Image/video uploads |
| Payments | Razorpay, PhonePe, Cashfree, CCAvenue, PayU | 5-gateway system |
| Email | Resend | Transactional emails |
| Caching | Upstash Redis | Rate limiting + availability cache |
| Job Queue | Upstash QStash | Cron verification |
| iCal Sync | node-ical + ical-generator | OTA calendar sync |
| Hosting | Vercel | Single deployment |
| Image Processing | sharp | Resizing and optimization |
| Animations | framer-motion | Frontend page transitions |
| Icons | lucide-react | Consistent icon set |

---

## Project Structure

```
/
├── app/
│   ├── (pages)/                 ← Public resort website
│   │   ├── page.tsx             ← Homepage
│   │   ├── rooms/              ← Room listing + detail pages
│   │   ├── wedding/            ← Wedding page
│   │   ├── banquet/            ← Banquet hall page
│   │   ├── pool/               ← Pool page
│   │   ├── events/             ← Events page
│   │   ├── attractions/        ← Local attractions
│   │   ├── gallery/            ← Photo/video gallery
│   │   ├── contact/            ← Contact + inquiry form
│   │   ├── booking/            ← Booking flow
│   │   └── layout.tsx          ← Public layout (navbar + footer)
│   │
│   ├── (admin)/                 ← Custom admin panel
│   │   ├── admin/
│   │   │   ├── layout.tsx       ← Admin shell (sidebar + header)
│   │   │   ├── page.tsx         ← Dashboard
│   │   │   ├── bookings/       ← Booking management
│   │   │   ├── rooms/          ← Room management
│   │   │   ├── front-desk/     ← Front desk operations
│   │   │   ├── calendar/       ← Availability calendar
│   │   │   ├── channel-manager/← OTA sync dashboard
│   │   │   ├── gallery/        ← Media/gallery management
│   │   │   ├── reviews/        ← Review management
│   │   │   ├── inquiries/      ← Inquiry management
│   │   │   ├── content/        ← CMS page editor
│   │   │   ├── analytics/      ← Advanced reports
│   │   │   ├── audit-log/      ← Activity tracking
│   │   │   ├── users/          ← Staff management
│   │   │   └── settings/       ← Payment config, site settings
│   │   └── login/              ← Auth pages
│   │
│   └── api/                     ← API routes
│       ├── availability/
│       ├── bookings/
│       ├── dashboard/
│       ├── front-desk/
│       ├── payments/
│       │   ├── order/
│       │   ├── initiate/{ccavenue,payu}/
│       │   ├── webhooks/{razorpay,phonepe,cashfree}/
│       │   └── callbacks/{ccavenue,payu}/
│       ├── inquiry/
│       ├── ical/export/
│       ├── cron/sync-ical/
│       ├── media/upload/
│       └── audit/
│
├── db/                          ← Drizzle schema + migrations
│   ├── schema/
│   │   ├── rooms.ts
│   │   ├── bookings.ts
│   │   ├── inquiries.ts
│   │   ├── blocked-dates.ts
│   │   ├── gallery.ts
│   │   ├── reviews.ts
│   │   ├── media.ts
│   │   ├── users.ts
│   │   ├── site-content.ts
│   │   ├── payment-config.ts
│   │   ├── audit-log.ts
│   │   └── index.ts             ← Re-exports all schemas
│   ├── migrations/
│   ├── drizzle.config.ts
│   └── client.ts                ← Drizzle client singleton
│
├── components/
│   ├── admin/                   ← Admin panel components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── user-menu.tsx
│   │   ├── dashboard/
│   │   ├── bookings/
│   │   ├── front-desk/
│   │   ├── calendar/
│   │   ├── channel-manager/
│   │   ├── content-editor/
│   │   ├── analytics/
│   │   └── shared/              ← Reusable admin components
│   ├── ui/                      ← shadcn/ui components
│   ├── shared/                  ← Shared editorial components
│   ├── rooms/                   ← Room page components
│   ├── gallery/
│   ├── wedding/
│   ├── contact/
│   └── layout/                  ← Site-wide layout (navbar, footer)
│
├── lib/                         ← Utility modules
│   ├── db.ts                    ← Drizzle query helpers
│   ├── auth.ts                  ← Supabase auth helpers
│   ├── supabase/
│   │   ├── server.ts            ← Server-side Supabase client
│   │   └── client.ts            ← Browser-side Supabase client
│   ├── data.ts                  ← Frontend data fetching (public pages)
│   ├── types.ts                 ← Shared TypeScript types
│   ├── email.ts                 ← Resend email helpers
│   ├── redis.ts                 ← Upstash Redis client
│   ├── audit.ts                 ← Audit log helper
│   ├── payments/                ← Payment gateway implementations
│   └── utils.ts                 ← General utilities
│
├── middleware.ts                ← Auth guard for /admin routes
└── drizzle.config.ts           ← Drizzle Kit configuration
```

---

## Database Schema (Drizzle)

### Existing Tables (migrated from Payload)

| Table | Purpose |
|---|---|
| `rooms` | Room inventory with pricing, amenities, images |
| `bookings` | Guest reservations + payment tracking |
| `inquiries` | Event/wedding inquiry submissions |
| `blocked_dates` | Calendar blocking (manual + iCal sync) |
| `gallery` | Categorized photo/video gallery items |
| `reviews` | Guest reviews with publish control |
| `media` | Upload metadata (S3-backed) |
| `users` | Staff accounts (linked to Supabase Auth) |
| `site_content` | Per-page editable content (replaces Content global) |
| `payment_config` | Payment gateway settings (replaces PaymentConfig global) |

### New Tables

| Table | Purpose |
|---|---|
| `audit_log` | Staff action tracking (who did what, when) |
| `room_status_log` | Room status transitions (check-in, checkout, cleaning, maintenance) |

---

## Role-Based Access Control (RBAC)

| Role | Access Level |
|---|---|
| `super_admin` | Full access to everything including user management, payment config, audit logs |
| `resort_manager` | All operations except user management and payment credentials |
| `front_desk` | Bookings, check-in/out, availability, guest handling, inquiries |
| `event_manager` | Inquiries, event bookings, gallery, reviews |
| `accountant` | Revenue reports, payment status, analytics (read-only on bookings) |
| `content_manager` | CMS content, gallery, reviews, SEO settings |

### Auth Flow

1. Staff logs in at `/admin/login` with email/password via Supabase Auth
2. Supabase session stored in HTTP-only cookie via `@supabase/ssr`
3. Middleware at `middleware.ts` protects all `/admin/*` routes
4. Role fetched from `users` table (linked by `auth.uid()`)
5. Server components check role before rendering
6. API routes validate session + role before mutations

---

## Admin Panel Modules

### Dashboard (`/admin`)
- KPI cards: occupancy, revenue, bookings, check-ins/outs
- 7-day room availability calendar grid
- Revenue chart (Recharts line/bar)
- Recent bookings table
- Upcoming check-ins
- Pending inquiries count

### Bookings (`/admin/bookings`)
- TanStack Table with filters (status, dates, room, source, payment)
- Inline status updates
- Booking detail view with full guest info + payment history
- Create new booking form
- Export to CSV

### Front Desk (`/admin/front-desk`)
- Today's arrivals and departures
- Walk-in booking quick form
- Check-in / check-out actions
- Room status board (available → occupied → cleaning → available)
- Invoice generation
- Guest quick-search

### Calendar (`/admin/calendar`)
- Rooms x Dates grid (like Lodgify reference)
- Color-coded statuses: available (green), booked (olive), occupied (blue), blocked (gray), maintenance (orange), checkout-pending (yellow)
- Click to block/unblock dates
- Drag to create booking
- Filter by room type

### Channel Manager (`/admin/channel-manager`)
- OTA connection status (Booking.com, MakeMyTrip, Goibibo)
- Last sync timestamp per channel
- Sync log with success/failure indicators
- Manual sync trigger
- Conflict resolution (double-booking alerts)
- iCal URL management

### Gallery (`/admin/gallery`)
- Grid view with drag-reorder
- Upload images + videos
- Category management
- Album grouping
- Bulk actions (delete, re-categorize)

### Reviews (`/admin/reviews`)
- Star rating display
- Publish/unpublish toggle
- Source indicator (Google, manual)
- Average rating + distribution chart

### Inquiries (`/admin/inquiries`)
- Status pipeline (New → Contacted → Closed)
- Quick reply actions
- Filter by event type

### Content Editor (`/admin/content`)
- Per-page structured editor
- Pages: Homepage, Rooms, Wedding, Banquet, Pool, Events, Attractions, Gallery, Contact
- Each page: hero image, heading, subtext, sections, SEO meta
- Header/Footer editor (nav links, social links, contact info)
- Live preview option

### Analytics (`/admin/analytics`)
- Revenue over time (line chart)
- Occupancy trends (area chart)
- Booking source breakdown (donut chart)
- Cancellation rate
- Average stay duration
- Revenue by room type
- Monthly comparison tables
- Date range selector with presets

### Audit Log (`/admin/audit-log`)
- Filterable activity feed
- Tracks: booking edits, status changes, pricing changes, content updates, user actions
- Staff member filter
- Date range filter
- Action type filter

### Users (`/admin/users`)
- Staff account management (super_admin only)
- Role assignment
- Active/inactive toggle
- Last login tracking

### Settings (`/admin/settings`)
- Payment gateway configuration
- Site-wide settings (resort name, contact, social)
- iCal feed URLs
- Email templates (future)

---

## Vercel Deployment Rules

### Build Command
```
npx drizzle-kit generate && next build
```

### Critical Rules

1. **Never instantiate service clients at module level**
   Any client reading `process.env` must be created inside the function body.

   ```typescript
   // WRONG
   const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL })

   // CORRECT
   export function getRedis() {
     return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL! })
   }
   ```

2. **Drizzle client must be lazy-initialized**
   ```typescript
   // db/client.ts
   import { drizzle } from 'drizzle-orm/postgres-js'
   import postgres from 'postgres'
   import * as schema from './schema'

   let _db: ReturnType<typeof drizzle> | null = null

   export function getDb() {
     if (!_db) {
       const client = postgres(process.env.DATABASE_URI!)
       _db = drizzle(client, { schema })
     }
     return _db
   }
   ```

3. **No filesystem writes at runtime** — Vercel is read-only. All uploads go through Supabase S3.

4. **`"type": "module"` in package.json** — All files use ESM. No `require()`.

5. **Required env vars**
   ```
   DATABASE_URI                  # Supabase Postgres connection string
   NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon key
   SUPABASE_SERVICE_ROLE_KEY     # For server-side auth operations
   SUPABASE_S3_BUCKET            # Media storage bucket
   SUPABASE_S3_ACCESS_KEY        # S3 access key
   SUPABASE_S3_SECRET_KEY        # S3 secret key
   SUPABASE_S3_ENDPOINT          # S3 endpoint URL
   NEXT_PUBLIC_SERVER_URL         # Deployment URL
   UPSTASH_REDIS_REST_URL         # Redis caching
   UPSTASH_REDIS_REST_TOKEN       # Redis token
   QSTASH_CURRENT_SIGNING_KEY     # Cron verification
   QSTASH_NEXT_SIGNING_KEY        # Cron verification
   RESEND_API_KEY                 # Email sending
   ADMIN_EMAIL                    # Admin notification recipient
   ```

6. **Verify locally before pushing**
   ```bash
   npm run build
   ```

---

## Booking Flow

```
Guest selects room + dates on website
  → GET /api/availability (check blocked_dates + bookings)
  → Fill guest details form
  → Pay Online → POST /api/payments/order → Gateway → webhook confirms
  → Pay at Reception → POST /api/bookings → saved as pending
  → Confirmation email via Resend
  → Booking appears in admin dashboard
```

Price calculation: `subtotal = nights x price_per_night` → `GST = subtotal x 0.12` → `total = subtotal + GST`

---

## Front Desk Operations Flow

```
Walk-in guest arrives
  → Front desk creates booking via /admin/front-desk
  → Selects room, enters guest details
  → Marks payment method (cash/card at reception)
  → Room status: available → occupied
  
Check-out
  → Front desk marks check-out
  → Room status: occupied → checkout_pending
  → Generates invoice summary
  → Room status: checkout_pending → available (after cleaning)
```

---

## Channel Manager (iCal Sync) Flow

```
EXPORT: GET /api/ical/export
  → Query confirmed bookings from Drizzle
  → Generate .ics via ical-generator

IMPORT: POST /api/cron/sync-ical (QStash every 30 min)
  → Verify QStash signature
  → Pull iCal feeds from site_content table (Booking.com, MMT URLs)
  → Parse with node-ical
  → Upsert into blocked_dates table
  → Log sync result for channel manager dashboard

CONFLICT DETECTION:
  → On new booking creation, check blocked_dates for OTA conflicts
  → Flag double-booking attempts in audit log
  → Notify admin via dashboard alert
```

---

## Audit Logging

Every mutation in the admin panel logs to `audit_log`:

```typescript
await logAudit({
  user_id: session.user.id,
  action: 'booking.status_changed',
  entity_type: 'booking',
  entity_id: bookingId,
  old_value: { status: 'pending' },
  new_value: { status: 'confirmed' },
})
```

Tracked actions:
- Booking created, updated, cancelled, status changed
- Room pricing changed, room activated/deactivated
- Content updated (any page)
- User created, role changed
- Payment config modified
- iCal sync results
- Gallery items added/removed

---

## CMS Content Structure

Each page has a JSON record in `site_content` with structured fields:

| Page | Editable Fields |
|---|---|
| Homepage | hero_image, hero_heading, tagline, featured_rooms_heading, cta_text, cta_link |
| Rooms | banner_image, page_heading, page_description, seo_title, seo_description |
| Wedding | hero_image, heading, description, gallery_images, packages_text |
| Banquet | hero_image, heading, description, capacity_info, features_list |
| Pool | hero_image, heading, description, timings, rules |
| Events | hero_image, heading, description, event_types |
| Attractions | hero_image, heading, description, attractions_list |
| Gallery | hero_image, heading, description |
| Contact | hero_image, heading, phone, email, address, whatsapp, map_embed |
| Header | logo, nav_links[], cta_button_text, cta_button_link |
| Footer | about_text, social_links, contact_info, copyright_text |
| SEO (global) | default_title_suffix, og_image, site_description |

---

## Hard Rules

- No Payload CMS — completely removed
- No Prisma — Drizzle ORM only
- No custom auth — Supabase Auth only
- No module-level env reads in API routes
- No filesystem writes at runtime
- No REST-to-REST internal calls — use Drizzle directly in server components and API routes
- Zod validation on all API route inputs
- Rate limit public APIs (bookings, inquiry, payments) via Upstash Redis
- Payment webhooks verify gateway signatures before processing
- QStash cron verifies signing keys
- All admin routes protected by middleware (session + role check)
- Every admin mutation creates an audit log entry
- Run `npm run build` locally before pushing to Vercel

---

## Admin Panel Design Principles

### Intent

**Who:** Resort managers, front-desk staff, event coordinators, and accountants in a small-to-mid-size Indian resort. They work in shifts, often on mid-range laptops, sometimes tablets. Not developers — they need clarity without training.

**What they accomplish:** Manage daily operations — check guests in/out, track revenue, handle bookings from multiple channels, update website content, and monitor resort performance.

**How it should feel:** Like a well-organized resort lobby — warm but professional, green and natural (matching the resort's garden identity), spacious but information-dense where needed. Not cold-corporate, not playful-consumer. Grounded and capable.

### Design Direction (derived from Lodgify reference + resort identity)

**Domain concepts:** Garden, hospitality, ledger, reception desk, calendar, occupancy board, key rack, guest register

**Color world:**
- Garden green (brand primary `#386a0e`) — nature, growth, the resort's identity
- Warm cream (`#fffdf8`) — paper, reception desk warmth
- Gold accent (`#ba7517`) — premium hospitality, revenue highlight
- Soft olive (`#eef4e7`) — secondary surfaces, garden undertone
- Status palette: green (confirmed), amber (pending), red (cancelled), blue (checked-in), gray (blocked)

**Signature element:** The room availability calendar grid — rooms on Y-axis, dates on X-axis, color-coded dots/blocks showing status at a glance. This is the operational heartbeat of the resort and the primary navigation anchor for front-desk staff.

### Token Architecture

```
--background: #f8f9f4        (warm off-white, slight green undertone)
--foreground: #111827        (near-black for text)
--card: #ffffff              (pure white cards on warm background)
--card-foreground: #111827
--primary: #386a0e           (brand green)
--primary-light: #eef4e7    (green tint for backgrounds)
--gold: #ba7517             (revenue/premium accent)
--gold-light: #fef3c7       (gold tint for backgrounds)
--muted: #f3f4f6            (neutral gray for disabled/secondary)
--muted-foreground: #6b7280
--border: #e5e7eb           (subtle, disappears on blur)
--ring: #386a0e             (focus indicator = brand)
```

### Depth Strategy: Subtle shadows

- Cards: `shadow-sm` (barely visible lift)
- Dropdowns/popovers: `shadow-md`
- Modals: `shadow-lg` with backdrop
- No border-heavy designs — borders are whisper-quiet (`border-border` at low opacity)
- Active/selected states use background color shift, not outline

### Typography

- **Display (headings):** Plus Jakarta Sans — geometric, modern, readable at large sizes
- **Body (UI text):** Plus Jakarta Sans — same family for consistency, different weights for hierarchy
- **Monospace (numbers/data):** Geist Mono — tabular figures, great for financial data and IDs
- Heading: 600-700 weight, tight tracking
- Body: 400-500 weight
- Labels: 500 weight, uppercase tracking for section dividers
- Data: monospace, tabular nums

### Spacing

- Base unit: 4px
- Component internal padding: 12-16px
- Card padding: 20-24px
- Section gaps: 24-32px
- Page margins: 24px (mobile) / 32px (desktop)

### Border Radius

- Buttons/inputs: 8px (rounded-lg)
- Cards: 12px
- Modals: 16px
- Badges/pills: full (rounded-full)
- No mixing sharp and round

### Component Patterns

**KPI Cards:** Large number (32px, mono, bold), label below (13px, uppercase, muted), colored top border (4px) indicating category, trend indicator (arrow + percentage)

**Data Tables (TanStack Table):**
- Compact rows (44px height)
- Sticky header with uppercase labels (11px)
- Hover state: soft background shift
- Action column with icon buttons
- Filter bar above with segmented controls

**Calendar Grid:**
- Fixed left column (room names)
- Scrollable date columns
- Status dots: 28px rounded squares with colored dots
- Today column highlighted
- Legend below

**Sidebar Navigation:**
- 260px width, white background, border-right
- Icon (20px) + label
- Active state: primary background tint + bold text
- Grouped sections with muted uppercase labels
- Collapsible on mobile

**Status Badges:** Pill-shaped, border + background tint + colored text. Defined set:
- Confirmed: green
- Pending: amber
- Cancelled: red
- Checked-in: blue
- Blocked: gray
- Maintenance: orange

### Charts (Recharts)

- Line charts for trends (revenue over time)
- Bar charts for comparisons (bookings by source)
- Donut charts for composition (room type distribution)
- Color palette: chart-1 through chart-5 from tailwind config
- Minimal axis labels, no grid lines, soft tooltips
- Responsive container, aspect ratio maintained

### Interaction Patterns

- **Optimistic updates** for status changes (instant UI, background sync)
- **Toast notifications** for mutations (react-hot-toast, already installed)
- **Confirmation dialogs** for destructive actions (delete, cancel booking)
- **Inline editing** where possible (status dropdowns, quick notes)
- **Loading skeletons** for all data-dependent views
- **Empty states** with illustration/icon + CTA action
- **Keyboard shortcuts** for power users (front desk: quick search with Cmd+K)

### Responsive Behavior

- Admin panel: desktop-first (min 1024px full experience)
- Sidebar collapses to icon-only on < 1024px
- Tables scroll horizontally on smaller screens
- Dashboard KPIs stack on mobile
- Front desk view optimized for tablet landscape

---

## File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `booking-table.tsx`)
- Schema files: `kebab-case.ts` (e.g., `blocked-dates.ts`)
- API routes: `route.ts` inside directory structure
- Types: co-located in `lib/types.ts` or adjacent to schema
- No barrel files (`index.ts`) except for `db/schema/index.ts`

---

## Development Workflow

1. Schema changes: edit `db/schema/*.ts` → run `npx drizzle-kit generate` → apply with `npx drizzle-kit push`
2. New admin page: create route in `app/(admin)/admin/[module]/page.tsx` → add to sidebar nav
3. New API route: create `app/api/[name]/route.ts` → add Zod schema → add auth check → add audit log
4. Content changes: edit structured fields via admin content editor → stored in `site_content` table
5. Always run `npm run build` before committing
