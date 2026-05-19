# Payload CMS Architecture Analysis — Madhuban Garden Resort

## Context

This document is a complete technical audit of the Payload CMS architecture inside the Madhuban Garden Resort website. It covers how content flows from CMS to frontend, how the backend integrates with external services, and identifies all coupling points, dependencies, and architectural risks. This analysis supports future decision-making around CMS changes, refactoring, or migration.

---

## 1. Overall Architecture

### Framework & Runtime

| Aspect | Detail |
|--------|--------|
| Framework | Next.js 15.4.11 (App Router) |
| CMS | Payload CMS v3.80.0 (embedded in same Next.js app) |
| Node.js | ESM (`"type": "module"` in package.json) |
| TypeScript | Strict mode, `target: ES2017`, `moduleResolution: bundler` |
| Hosting | Vercel (single deployment — frontend + admin) |

### How Payload is Integrated

Payload CMS v3 runs **embedded** inside the Next.js application — NOT as a standalone server. It shares the same Next.js process, database connection, and build pipeline. This is achieved via:

- `payload.config.ts` at the project root — the central configuration
- `app/(payload)/` route group — provides the `/admin` panel and REST/GraphQL API endpoints
- `@payload-config` TypeScript path alias mapping to `./payload.config.ts`
- Build command: `payload generate:importmap && next build` (Payload generates its admin UI import map before Next.js builds)

### Server Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Single Vercel Deployment              │
├─────────────────────────────────────────────────────────┤
│  app/(pages)/  → Public frontend (SSR Server Components)│
│  app/(payload)/admin/ → Payload Admin Panel (SPA)       │
│  app/(payload)/api/   → Payload REST + GraphQL API      │
│  app/api/             → Custom API routes (bookings,    │
│                         payments, availability, cron)    │
├─────────────────────────────────────────────────────────┤
│  Payload Local API ← All internal data access           │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (Supabase)  │  S3 (Supabase Storage)        │
│  Redis (Upstash)        │  QStash (cron verification)   │
│  Resend (email)         │  Razorpay/PhonePe/etc (pay)   │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure (Payload-relevant)

```
/
├── payload.config.ts          ← Central Payload config
├── collections/               ← 8 collection definitions
│   ├── Users.ts
│   ├── Media.ts
│   ├── Rooms.ts
│   ├── Bookings.ts
│   ├── Inquiries.ts
│   ├── BlockedDates.ts
│   ├── Gallery.ts
│   └── Reviews.ts
├── globals/                   ← 2 global definitions
│   ├── Content.ts
│   └── PaymentConfig.ts
├── src/access/index.ts        ← Shared access control functions
├── components/admin/          ← Custom admin panel components
├── lib/data.ts                ← Payload Local API fetch layer
├── lib/types.ts               ← Frontend-facing normalized types
├── app/(payload)/             ← Payload route group
│   ├── admin/[[...segments]]/ ← Admin SPA catch-all
│   ├── api/[...slug]/         ← REST API catch-all
│   └── api/graphql/           ← GraphQL endpoint
└── app/api/                   ← Custom business logic API routes
```

---

## 2. Payload Configuration

**File:** `payload.config.ts`

### Database

- **Adapter:** `@payloadcms/db-postgres` (PostgreSQL via connection pool)
- **Connection:** `process.env.DATABASE_URI` → Supabase PostgreSQL
- No custom migrations, indexes, or hooks at the DB adapter level

### Rich Text Editor

- **Lexical editor** (`@payloadcms/richtext-lexical`) — Payload's native rich text solution
- Used only in the Rooms `description` field
- No custom Lexical features, plugins, or blocks configured

### Image Processing

- **Sharp** (`sharp`) — configured for server-side image processing
- Used by the Media upload collection

### Media Storage

- **Plugin:** `@payloadcms/storage-s3`
- **Provider:** Supabase Storage (S3-compatible API)
- **Bucket:** `madhuban-media` (env: `SUPABASE_S3_BUCKET`)
- **Region:** `ap-south-1`
- **Config:** `forcePathStyle: true` (required for Supabase S3 endpoints)
- Applied to: `media` collection only
- No image sizes/transforms defined at the Payload level (relies on Next.js `Image` optimization)

### Admin Panel Customization

| Feature | Implementation |
|---------|---------------|
| Custom navigation | `/components/admin/Nav` — role-based nav with custom sections |
| Dashboard metrics | `/components/admin/DashboardMetrics` — full KPI dashboard |
| Custom views | Front Desk (`/front-desk`), Bookings List (`/bookings-view`), Reviews (`/reviews-view`) |
| Cell components | `PhoneLinkCell`, `StarRatingCell`, `StatusBadgeCell` — custom list column renderers |
| UI field | `ViewOnSiteLink` — link to frontend from Rooms edit |
| Theme | Light theme forced |
| Date format | `dd MMM yyyy` |

### Authentication

- Auth collection: `users`
- Built-in Payload auth (email + password, JWT-based sessions)
- No external auth providers configured
- No custom auth strategies

### Plugins

Only 1 plugin: `@payloadcms/storage-s3` for media uploads

### Missing/Not Configured

- No localization (single language)
- No versioning/drafts
- No live preview
- No custom endpoints at the Payload level
- No SEO plugin
- No form builder plugin
- No search plugin
- No email adapter (Payload uses its built-in for admin emails)

---

## 3. Collections Analysis

### 3.1 Users (Auth Collection)

| Aspect | Detail |
|--------|--------|
| Slug | `users` |
| Purpose | Admin and staff accounts for Payload admin panel |
| Auth | Built-in Payload auth (email/password) |
| Group | System |
| Fields | `name` (text, required), `role` (select: admin/staff) |
| Access | All CRUD: `isAdmin` only |
| Field-level access | `role` update: admin only |
| Admin visibility | Hidden from non-admin users |
| Hooks | None |

**Classification:** System/infrastructure — low complexity, no frontend exposure.

### 3.2 Media (Upload Collection)

| Aspect | Detail |
|--------|--------|
| Slug | `media` |
| Purpose | All uploaded images (rooms, gallery) |
| Group | System |
| Upload | Accepts `image/*` only |
| Storage | Supabase S3 bucket via `@payloadcms/storage-s3` |
| Fields | `alt` (text, required) |
| Access | Read/Create/Update: adminOrStaff; Delete: admin only |
| Image sizes | None defined (no thumbnails configured) |
| Hooks | None |

**Classification:** Infrastructure — central to all image-dependent features. No image size variants means all optimization relies on Next.js `<Image>` component.

### 3.3 Rooms

| Aspect | Detail |
|--------|--------|
| Slug | `rooms` |
| Purpose | Room inventory — the core bookable entity |
| Group | Main |
| Fields | `slug` (unique), `name`, `type` (standard/deluxe/suite), `description` (richText), `price_per_night`, `capacity`, `bed_type`, `room_size`, `amenities` (array of text), `images` (upload→media, hasMany), `is_active` (checkbox) |
| Access | Read: adminOrStaff; Create/Update/Delete: admin only |
| UI field | `view_on_site` — links to `/rooms/{slug}` on frontend |
| Relationships | Images → Media (hasMany upload) |
| Hooks | None |

**Classification:** Core business entity — consumed by frontend pages, availability API, booking flow, dashboard, and iCal sync. Critical and heavily referenced.

### 3.4 Bookings

| Aspect | Detail |
|--------|--------|
| Slug | `bookings` |
| Purpose | Guest reservations — operational business data |
| Group | Main |
| Default sort | `-check_in` (newest first) |
| Fields | `guest_name`, `guest_phone`, `guest_email`, `room` (relationship→rooms), `check_in` (date), `check_out` (date), `guests_count`, `nights` (computed, read-only), `payment_method` (online/at_reception), `payment_status` (pending/paid/failed/refunded), `total_amount`, `gateway_used` (razorpay/phonepe/cashfree/ccavenue/payu), `gateway_order_id`, `gateway_payment_id`, `source` (website/booking_com/mmt/manual), `status` (confirmed/pending/cancelled) |
| Access | Read/Create/Update: adminOrStaff; Delete: admin only |
| Field-level access | `payment_status`, `total_amount`: admin only |
| Hooks | `afterRead`: computes `nights` from check_in/check_out |
| Admin UI | Tabs (Guest Info, Booking Details, Payment Info), custom cell components |
| Relationships | `room` → Rooms |

**Classification:** Core operational — the most complex collection with computed fields, payment integration, and multi-source data. Critical for availability, revenue, and iCal.

### 3.5 Inquiries

| Aspect | Detail |
|--------|--------|
| Slug | `inquiries` |
| Purpose | Event/wedding inquiry submissions from the contact form |
| Group | Management |
| Default sort | `-createdAt` |
| Fields | `name`, `phone`, `email`, `event_type` (wedding/birthday/corporate/other), `event_date`, `guests_count`, `message`, `status` (new/contacted/closed), `staff_notes` |
| Access | All: adminOrStaff |
| Hooks | None |
| Admin | Tabs (Contact Info, Event Details, Status & Notes), StatusBadgeCell |

**Classification:** Operational — simple CRM-like workflow. No frontend read dependency.

### 3.6 BlockedDates

| Aspect | Detail |
|--------|--------|
| Slug | `blocked-dates` |
| Purpose | Dates blocked per room (from iCal sync or manual entry) |
| Group | Management |
| Fields | `room` (relationship→rooms), `date`, `source` (ical/manual), `ical_uid` (conditional) |
| Access | All: adminOrStaff |
| Hooks | None |
| Conditional UI | `ical_uid` field only visible when source=ical |

**Classification:** Operational support — consumed by availability API and iCal sync cron. Medium criticality.

### 3.7 Gallery

| Aspect | Detail |
|--------|--------|
| Slug | `gallery` |
| Purpose | Curated photo gallery for the frontend |
| Group | Management |
| Default sort | `sort_order` |
| Fields | `image` (upload→media), `category` (rooms/wedding/events/pool/restaurant), `caption`, `sort_order` |
| Access | Read/Create/Update: adminOrStaff; Delete: admin only |
| Hooks | None |
| Relationships | `image` → Media |

**Classification:** Content — feeds the `/gallery` page. Simple structure, frontend-consumed.

### 3.8 Reviews

| Aspect | Detail |
|--------|--------|
| Slug | `reviews` |
| Purpose | Guest reviews displayed on the homepage |
| Group | Management |
| Default sort | `is_published` |
| Fields | `guest_name`, `rating` (1-5), `review_text`, `source` (google/manual), `is_published` (checkbox) |
| Access | Read/Create/Update: adminOrStaff; Delete: admin only |
| Field-level access | `is_published`: admin only |
| Hooks | None |
| Admin | StarRatingCell for rating display |

**Classification:** Content — simple, frontend-consumed on homepage. Only published reviews are shown.

### Collection Interconnection Map

```
Rooms ←──── Bookings.room
Rooms ←──── BlockedDates.room
Media ←──── Rooms.images (hasMany)
Media ←──── Gallery.image
```

**Critical collections:** Rooms, Bookings (everything depends on them)
**Safe/simple collections:** Gallery, Reviews, Inquiries (minimal coupling)
**Special handling:** BlockedDates (iCal sync writes to it automatically)

---

## 4. Globals Analysis

### 4.1 Content Global

| Aspect | Detail |
|--------|--------|
| Slug | `content` |
| Purpose | Site-wide editable text, contact info, social links, iCal URLs |
| Group | Settings |
| Access | Read: adminOrStaff; Update: admin only |

**Structure (tabs):**

1. **General** → `hero` group (tagline, hero_heading, hero_subtext), `wedding` group (wedding_heading, wedding_description)
2. **Contact** → `contact` group (phone, email, address, whatsapp_number)
3. **Social Media** → `social` group (instagram_url, facebook_url)
4. **OTA Settings** → `ical` group (bookingcom_ical_url, mmt_ical_url)

**Frontend usage:** Consumed by `getSiteContent()` in `lib/data.ts`, which is called on EVERY page (layout, homepage, rooms, room detail, gallery). It feeds the navbar, footer, WhatsApp button, and page metadata.

**Dependency:** The iCal sync cron also reads this global to get OTA feed URLs.

### 4.2 PaymentConfig Global

| Aspect | Detail |
|--------|--------|
| Slug | `payment-config` |
| Purpose | Admin-managed payment gateway credentials and active gateway selection |
| Group | Settings |
| Access | Read: admin only; Update: admin only |
| Admin visibility | Hidden from non-admin users |

**Structure:**

- `active_gateway` (select: razorpay/phonepe/cashfree/ccavenue/payu)
- Per-gateway collapsible sections with:
  - `{gateway}_enabled` (checkbox)
  - Credentials (API keys, secrets)
  - Environment selectors (sandbox/production)

**Frontend usage:** Never exposed to frontend. Read server-side by `resolveActiveGateway()` in the payments API routes.

**Architectural note:** Payment credentials are stored IN THE DATABASE rather than in environment variables. This is a deliberate design choice allowing the admin to switch gateways without redeployment.

---

## 5. Media & Upload System

### Storage Architecture

```
Upload Request → Payload Media Collection → @payloadcms/storage-s3 plugin
                                          → Supabase S3 Bucket (madhuban-media)
                                          → Object URL returned to DB record
```

### Configuration

- **Accepted types:** `image/*` only
- **Image sizes:** NONE defined — no thumbnails, no responsive variants at Payload level
- **CDN:** Supabase Storage provides direct object URLs; no additional CDN layer
- **Alt text:** Required field on every upload

### Frontend Rendering Pattern

Images flow through:
1. Payload stores the Media document with `url` and `filename`
2. `lib/data.ts` normalizes: extracts `.url` from the upload relation object
3. Frontend components use `next/image` with the raw URL (Unsplash URLs currently as placeholders)

**Current state observation:** Based on the git history ("replace all placeholder content with client-ready Unsplash images"), the codebase currently uses Unsplash URLs as image sources. The S3 upload system is configured but likely not yet populated with real media through the admin panel.

### Image Optimization

All optimization happens client-side via Next.js `<Image>` component:
- `sizes` prop used for responsive loading
- `priority` prop for above-fold images
- No Payload-level image transforms

### Risk Areas

- No image size variants means large images are served at full resolution and resized client-side
- No CDN configuration beyond Supabase's default
- No cache headers configured for media

---

## 6. Frontend CMS Integration

### Data Fetching Layer

**Primary file:** `lib/data.ts` (marked `import 'server-only'`)

**Pattern:** Server-side only Payload Local API access. No REST or GraphQL used internally.

```typescript
const payload = await getPayload({ config })
const result = await payload.find({ collection: '...', where: {...} })
```

### Functions Provided

| Function | Collection/Global | Used By |
|----------|------------------|---------|
| `getSiteContent()` | Content global | Layout, all pages (metadata) |
| `getRooms()` | Rooms (is_active=true) | Rooms page |
| `getRoomBySlug(slug)` | Rooms | Room detail page |
| `getFeaturedRooms()` | Rooms (top 3 by price) | Homepage |
| `getRelatedRooms(slug)` | Rooms (excludes current) | Room detail page |
| `getReviews()` | Reviews (is_published=true) | Homepage |
| `getGallery(category?)` | Gallery | Gallery page |

### Data Normalization

`lib/data.ts` contains normalization functions that transform raw Payload documents into clean frontend types (`lib/types.ts`):

- `normalizeRoom()` — extracts amenities from `[{amenity: 'WiFi'}]` → `['WiFi']`, extracts image URLs from upload objects
- `normalizeReview()` — simple field extraction
- `normalizeGalleryItem()` — extracts image URL and alt from Media relation
- `extractPlainText()` — converts Lexical rich text JSON → plain string

**This is the decoupling layer** — frontend components never see raw Payload shapes.

### Rendering Strategy

| Page | Strategy | Data Source |
|------|----------|-------------|
| Homepage | SSR Server Component | `getFeaturedRooms()`, `getReviews()`, `getSiteContent()` |
| Rooms listing | SSR Server Component | `getRooms()` |
| Room detail | SSG + ISR via `generateStaticParams()` | `getRoomBySlug()`, `getRelatedRooms()` |
| Gallery | SSR Server Component | `getGallery()` |
| Wedding/Banquet/Pool/Events/Attractions/Contact | SSR Server Component | Static `lib/page-content.ts` (no CMS) |
| Admin dashboard | Client component | Fetches `/api/dashboard` |

### Caching Strategy

- **No explicit `revalidate` values** set on any page
- **No `cache: 'force-cache'`** or `unstable_cache` usage
- The Room detail page uses `generateStaticParams()` for build-time SSG
- Redis caching only for availability API (15-min TTL)
- No framework-level ISR or on-demand revalidation configured

### Static vs Dynamic Content

| Source | Type |
|--------|------|
| `lib/page-content.ts` | Hardcoded marketing content (wedding, banquet, pool, events, attractions, contact page structure) |
| `lib/data.ts` → Payload | Dynamic CMS content (rooms, gallery, reviews, site-wide text) |

**Important split:** Most editorial page content (heroes, descriptions, features) is hardcoded in `lib/page-content.ts`. Only rooms, gallery, reviews, and contact info come from the CMS.

---

## 7. Routing & Dynamic Pages

### Route Structure

```
app/
├── layout.tsx                    ← Root layout (metadata only)
├── (pages)/
│   ├── layout.tsx                ← Frontend shell (navbar, footer, fonts)
│   ├── page.tsx                  ← Homepage
│   ├── rooms/
│   │   ├── page.tsx              ← Rooms listing
│   │   └── [slug]/page.tsx       ← Room detail (SSG)
│   ├── gallery/page.tsx
│   ├── wedding/page.tsx
│   ├── banquet/page.tsx
│   ├── pool/page.tsx
│   ├── events/page.tsx
│   ├── attractions/page.tsx
│   ├── contact/page.tsx
│   └── booking/status/page.tsx   ← Post-payment status page
├── (payload)/
│   ├── layout.tsx                ← Payload admin layout
│   ├── admin/[[...segments]]/    ← Admin SPA catch-all
│   └── api/                      ← Payload REST + GraphQL
└── api/                          ← Custom business API routes
```

### Dynamic Routing

Only one dynamic route: `app/(pages)/rooms/[slug]/page.tsx`

- Uses `generateStaticParams()` to pre-generate all active room slugs at build time
- Falls back to `notFound()` for invalid slugs
- Slug comes from the Rooms collection `slug` field

### Metadata Generation

All pages use `generateMetadata()` async functions that call `getSiteContent()`:
- Root layout sets `metadataBase`, default title, and OG tags
- Child pages override title and description using room/page-specific data

### SEO Coupling

- OG titles and descriptions depend on CMS data (site name, tagline)
- Room detail metadata uses room name and description from Payload
- No sitemap generation
- No robots.txt configuration

---

## 8. Components & Blocks

### Architecture Pattern

The project uses a **Page View Component** pattern:

```
app/(pages)/[route]/page.tsx (Server Component)
  → fetches data via lib/data.ts
  → passes normalized data as props
  → renders [route]-page-view.tsx (Client Component)
```

### CMS-Driven Components

| Component | CMS Data | Coupling Level |
|-----------|----------|----------------|
| `HomePageView` | `RoomData[]`, `ReviewData[]`, `SiteContent` | Medium — receives normalized types |
| `RoomsPageView` | `RoomData[]` | Low — just maps rooms to cards |
| `RoomDetailPageView` | `RoomData`, `RoomData[]` (related) | Medium — deep field usage |
| `RoomCard` | `RoomData` | Medium — uses images, amenities, price, slug |
| `GalleryPageView` | `GalleryItemData[]` | Low — simple grid |
| `SiteNavbar` | `SiteContent` | Low — phone/whatsapp |
| `SiteFooter` | `SiteContent` | Low — contact info, social links |
| `FloatingWhatsAppButton` | `SiteContent` | Low — just whatsapp number |
| `RoomBookingWidget` | Room ID (from page context) | Medium — triggers API calls |

### Static Marketing Components

These render hardcoded content from `lib/page-content.ts` (NOT from CMS):

- `WeddingPageView`
- `BanquetPageView`
- `PoolPageView`
- `EventsPageView`
- `AttractionsPageView`
- `ContactPageView`

### Block/Layout System

**There is NO dynamic block/layout builder system.** Pages are hardcoded React components. There are no:
- Payload Blocks fields
- Dynamic renderers
- Flexible layout systems
- Content builder patterns

Each page is a fixed template that receives typed data props.

---

## 9. Authentication & Access

### Access Control Architecture

**File:** `src/access/index.ts`

```typescript
isAdmin          → user.role === 'admin'
isAdminOrStaff   → user.role in ['admin', 'staff']
denyAll          → always false
isAdminFieldLevel → field-level admin-only restriction
adminFullStaffRead → read: staff; all mutations: admin
```

### Role System

| Role | Capabilities |
|------|-------------|
| `admin` | Full access to all collections, globals, settings, user management |
| `staff` | Read access to most collections, Create/Update bookings and inquiries, manage gallery |

### Security Model

- Admin panel requires authentication (Payload built-in)
- Custom API routes (`/api/bookings`, `/api/payments/order`, `/api/inquiry`) are **PUBLIC** — no auth check (they serve website guests)
- `/api/dashboard` is **unauthenticated** but only used by the admin dashboard component
- `/api/cron/sync-ical` is protected by QStash signature verification
- Payment webhooks verify gateway-specific signatures (Razorpay `x-razorpay-signature`)

### Security Risks

1. **`/api/dashboard` has no auth** — exposes business metrics publicly. Currently mitigated only by obscurity.
2. **No CORS configuration** — API routes are callable from any origin.
3. **Payment credentials in database** — PaymentConfig global stores secrets in PostgreSQL rather than env vars. Accessible to anyone with DB read access.

---

## 10. Database & Data Relationships

### Database Type

- **PostgreSQL** via Supabase (managed)
- **Adapter:** `@payloadcms/db-postgres` with connection pooling
- Schema is fully managed by Payload (auto-migration)

### Relationship Map

```
Users (auth)
    └── (no relations)

Media (upload)
    ├── ← Rooms.images (hasMany)
    └── ← Gallery.image

Rooms
    ├── ← Bookings.room
    └── ← BlockedDates.room

Bookings
    └── → Rooms (belongsTo)

BlockedDates
    └── → Rooms (belongsTo)

Gallery
    └── → Media (belongsTo via upload)

Reviews
    └── (no relations)

Inquiries
    └── (no relations)

[Globals]
Content (standalone)
PaymentConfig (standalone)
```

### Data Complexity

- **Flat schema** — no deeply nested blocks, no polymorphic relationships
- **Simple relations** — all are direct belongsTo or hasMany via upload
- **Computed field** — Bookings.nights (calculated in afterRead hook, not persisted)
- **No array blocks** — only Rooms.amenities uses array (simple text array)
- **No joins** — Payload handles relations via foreign keys

### Storage Patterns

- Rich text (Lexical) stored as JSON in the `description` column
- Dates stored as ISO strings
- Upload fields store the Media document ID as a foreign key
- Array fields (amenities) stored as JSONB

---

## 11. Environment & Deployment

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URI` | Build + Runtime | PostgreSQL connection |
| `PAYLOAD_SECRET` | Build + Runtime | JWT signing, encryption |
| `SUPABASE_S3_BUCKET` | Runtime | Media storage bucket |
| `SUPABASE_S3_ACCESS_KEY` | Runtime | S3 auth |
| `SUPABASE_S3_SECRET_KEY` | Runtime | S3 auth |
| `SUPABASE_S3_ENDPOINT` | Runtime | S3 endpoint URL |
| `UPSTASH_REDIS_REST_URL` | Runtime (optional) | Caching |
| `UPSTASH_REDIS_REST_TOKEN` | Runtime (optional) | Caching |
| `QSTASH_CURRENT_SIGNING_KEY` | Runtime | Cron webhook verification |
| `QSTASH_NEXT_SIGNING_KEY` | Runtime | Cron webhook verification |
| `RESEND_API_KEY` | Runtime | Transactional email |
| `ADMIN_EMAIL` | Runtime | Inquiry notifications |
| `NEXT_PUBLIC_SERVER_URL` | Build | Public URL |

### Build Pipeline

```bash
payload generate:importmap    # Generates admin UI import map
next build                    # Builds all pages + API routes
```

### Deployment Dependencies

| Service | Purpose | Criticality |
|---------|---------|-------------|
| Supabase PostgreSQL | Primary database | Critical — nothing works without it |
| Supabase Storage (S3) | Media uploads | High — images won't upload without it |
| Upstash Redis | Availability caching, rate limiting | Medium — degrades gracefully |
| Upstash QStash | Cron job scheduling + verification | Medium — iCal sync won't run |
| Resend | Transactional email | Low — booking still works, email fails silently |
| Razorpay/PhonePe/etc | Payment processing | High — online payments fail |

### Infrastructure Coupling

- **Tight:** Supabase PostgreSQL (Payload won't start without it)
- **Tight:** Supabase S3 (configured in payload.config.ts plugin)
- **Loose:** Redis (graceful fallback to no-cache)
- **Loose:** Resend (fire-and-forget, try/catch)
- **Medium:** QStash (cron route will 500 without valid signature)

---

## 12. Technical Debt & Risks

### Identified Issues

1. **Unauthenticated Dashboard API**
   - `GET /api/dashboard` returns full business metrics with no auth check
   - Anyone who discovers the URL can read revenue, bookings, occupancy data
   - **Severity:** High

2. **Payment credentials in database**
   - PaymentConfig global stores API keys and secrets in PostgreSQL
   - Design choice (allows admin to switch gateways), but increases attack surface
   - No field-level encryption
   - **Severity:** Medium

3. **No revalidation strategy**
   - Pages have no `revalidate` tag or on-demand revalidation
   - After admin updates rooms/gallery/reviews, frontend may serve stale data until rebuild or function cold start
   - **Severity:** Medium

4. **Large page-content.ts file**
   - 774 lines of hardcoded marketing content that should arguably be CMS-managed
   - Wedding, banquet, pool, events, attractions, contact page content is frozen in code
   - Admin cannot update these without a developer
   - **Severity:** Low (intentional for Phase 1, planned for Phase 2)

5. **No image size variants**
   - Media collection has no `imageSizes` configuration
   - All images served at full resolution; Next.js Image does client-side resize
   - Could cause performance issues with large uploads
   - **Severity:** Low-Medium

6. **iCal sync limitation**
   - Currently syncs all OTA feeds against the first active room only
   - TODO comment acknowledges this: "When per-room iCal URLs are supported, map feeds to specific rooms"
   - **Severity:** Medium (functional limitation)

7. **No versioning or drafts**
   - No Payload versions enabled on any collection
   - Accidental deletes or edits have no rollback mechanism
   - **Severity:** Low

8. **`vercel.json` is empty**
   - Despite CLAUDE.md mentioning function timeout configuration
   - No cron schedules, no function limits configured
   - iCal cron relies entirely on QStash external scheduling
   - **Severity:** Low

### Coupling Hotspots

1. **`lib/data.ts`** — single point of coupling between frontend and Payload. If collection field names change, this file breaks.
2. **`lib/payments/resolve-gateway.ts`** — tightly coupled to PaymentConfig global field names. Adding a new gateway requires changes in: collection definition + resolve-gateway + new gateway class + webhook route.
3. **`app/(pages)/layout.tsx`** — calls `getSiteContent()` on every page load. If the Content global is misconfigured, all pages break.

---

## 13. Final Architecture Summary

### High-Level Overview

This is a **well-structured embedded Payload CMS v3 application** with clean separation between:
- CMS configuration (`collections/`, `globals/`, `src/access/`)
- Data access layer (`lib/data.ts`, `lib/types.ts`)
- Frontend presentation (`components/`, `app/(pages)/`)
- Business logic (`app/api/`, `lib/payments/`, `lib/email.ts`)

### Dependency Map

```
Frontend Pages
    ↓ (props)
Page View Components (client)
    ↑ (normalized types)
lib/data.ts (server-only)
    ↓ (Payload Local API)
Payload CMS Engine
    ↓
PostgreSQL (Supabase)

API Routes → Payload Local API → PostgreSQL
         → Redis (caching)
         → Resend (email)
         → Payment Gateways (via PaymentConfig global)
         → QStash (cron verification)
```

### Frontend/Backend Coupling Assessment

| Area | Coupling | Notes |
|------|----------|-------|
| Data types | **Low** | `lib/types.ts` provides a clean abstraction layer |
| Data fetching | **Medium** | `lib/data.ts` knows Payload API shape but normalizes it |
| Component rendering | **Low** | Components receive normalized props, never raw Payload data |
| Admin panel | **High** | Custom views/components directly use Payload UI kit |
| API routes | **High** | Directly use `getPayload()` + Payload Local API |
| Content structure | **Medium** | Field names in collections dictate `lib/data.ts` normalization |

### Complexity Assessment

| Area | Complexity | Reason |
|------|-----------|--------|
| Collections schema | Low | Flat, simple fields, minimal nesting |
| Relationships | Low | Only 2 relation types (room, media) |
| Access control | Low | 2 roles, 4 access functions |
| Payment integration | High | 5 gateways, admin-switchable, webhook verification |
| Admin customization | Medium | Custom dashboard, 3 views, 5 cell components |
| Frontend integration | Medium | Normalization layer + mixed static/dynamic content |

### Effort Estimate for Future CMS Abstraction

If migrating away from Payload CMS:

| Task | Effort |
|------|--------|
| Replace data layer (`lib/data.ts`) | Medium — rewrite ~6 functions to new CMS API |
| Migrate collections schema | Medium — 8 collections with simple fields |
| Recreate admin panel features | High — custom dashboard, views, role-based nav |
| Move payment config from global to env vars | Low |
| Migrate media storage | Medium — re-upload assets, update URL patterns |
| Rewrite API routes | Medium — replace `getPayload()` calls |
| Frontend components | **Zero changes** — they only know `lib/types.ts` |

**Total estimated effort:** 3-5 developer weeks for a full CMS swap, assuming the replacement CMS supports similar features. The normalization layer (`lib/data.ts` + `lib/types.ts`) is the key architectural win — it means frontend components are completely CMS-agnostic.
