# Payload CMS → Strapi Migration Plan

## Madhuban Garden Resort — Complete Architecture & Execution Strategy

**Target:** Strapi 5 (latest stable)
**Date:** 2026-05-14
**Status:** Planning

---

## 1. Current Architecture Analysis

### 1.1 Payload-Specific Dependencies

| Dependency | Location | Migration Impact |
|-----------|----------|-----------------|
| `payload` core | payload.config.ts, all API routes | Complete removal |
| `@payloadcms/db-postgres` | payload.config.ts | Replace with Strapi's native Postgres |
| `@payloadcms/richtext-lexical` | payload.config.ts, Rooms.description | Replace with Strapi's rich text (Blocks editor) |
| `@payloadcms/storage-s3` | payload.config.ts | Replace with `@strapi/provider-upload-aws-s3` |
| `@payloadcms/next` | app/(payload)/ routes | Remove entirely (Strapi is standalone) |
| `@payloadcms/ui` | components/admin/ | Remove — Strapi has its own admin |
| `getPayload({ config })` | lib/data.ts, all API routes | Replace with Strapi REST/SDK calls |
| `payload.find()` / `payload.findGlobal()` | lib/data.ts, API routes | Replace with Strapi API client |
| Payload access functions | src/access/index.ts | Replace with Strapi RBAC |
| Payload admin components | components/admin/* | Rebuild as Strapi admin extensions |
| `@payload-config` alias | tsconfig.json | Remove |
| `payload generate:importmap` | build script | Remove |

### 1.2 Migration-Sensitive Areas

| Area | Risk | Reason |
|------|------|--------|
| Payment webhooks | HIGH | Must remain functional during migration — no downtime acceptable |
| Booking flow | HIGH | Active business operations depend on this |
| iCal sync cron | MEDIUM | Can tolerate brief interruption |
| Dashboard API | MEDIUM | Internal tool, can switch with controlled cutover |
| Media URLs | MEDIUM | Changing URLs breaks cached references |
| Frontend pages | LOW | Decoupled via normalization layer |
| Email templates | LOW | Independent service (Resend) |

### 1.3 Reusable Architecture Patterns

These should be PRESERVED in the migration:

1. **`lib/data.ts` normalization layer** — This is the key decoupling mechanism. Only this file needs to change to point at Strapi's API instead of Payload's Local API.

2. **`lib/types.ts` frontend types** — These remain completely unchanged. Components depend on these types, not on CMS shapes.

3. **`lib/payments/` gateway abstraction** — Payment gateway logic is CMS-independent. The `PaymentGateway` interface, gateway classes, and `common.ts` shared helpers are pure business logic.

4. **`lib/email.ts`** — Completely CMS-independent. Uses Resend directly.

5. **`lib/redis.ts`** — Infrastructure utility, CMS-independent.

6. **Rate limiting pattern** — Used in booking/inquiry APIs. Logic stays the same.

### 1.4 Areas to Redesign During Migration

| Area | Current | Proposed |
|------|---------|----------|
| Admin dashboard | Custom React component fetching `/api/dashboard` | Strapi custom plugin with dedicated dashboard page |
| Payment credentials | Stored in Payload global (database) | Move to environment variables + Strapi admin config UI |
| Dashboard API auth | None (security gap) | Strapi authenticated API route |
| Static page content | Hardcoded in `lib/page-content.ts` | Migrate to Strapi Single Types (CMS-editable) |
| iCal sync trigger | QStash → Payload Local API | QStash → Next.js API → Strapi API |
| Rich text handling | Lexical JSON → plain text extraction | Strapi Blocks/Markdown → simpler rendering |

### 1.5 What Should Remain Untouched

- All frontend components (`components/`)
- All page files (`app/(pages)/`)
- `lib/types.ts`
- `lib/payments/` (entire directory)
- `lib/email.ts`
- `lib/redis.ts`
- `lib/room-helpers.ts`
- `lib/utils.ts`
- `lib/motion.ts`
- `lib/site-nav.ts`
- `components/ui/` (shadcn components)
- Tailwind configuration
- Public assets

### 1.6 Coupling & Risk Assessment

```
RISK MATRIX:

                    Low Impact ────────── High Impact
                    │                              │
High Likelihood ───├── Static page content ───── Payment flow break
                    │   Gallery display            Booking creation fail
                    │                              iCal sync corruption
                    │
Low Likelihood  ───├── Email templates ────────── Media URL breakage
                    │   Review display             Data loss during
                    │   Contact form               migration
                    │
```

**Overall migration risk: MEDIUM** — mitigated by the clean normalization layer.

---

## 2. Ideal Strapi Architecture

### 2.1 Deployment Architecture

**Decision: Strapi as a SEPARATE standalone service.**

Rationale:
- Strapi 5 cannot embed into Next.js (unlike Payload v3)
- Separation enables independent scaling, deployment, and admin access
- Strapi admin panel runs on its own port/domain
- Next.js frontend communicates via REST API

```
┌─────────────────────────────────────────────────────────────┐
│                    Architecture Overview                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐        ┌──────────────────────┐       │
│  │   Next.js App    │        │     Strapi CMS       │       │
│  │  (Vercel)        │◄──────►│  (Railway/Render)    │       │
│  │                  │  REST  │                      │       │
│  │  Frontend +      │  API   │  Admin Panel +       │       │
│  │  API Routes      │        │  Content API         │       │
│  └────────┬─────────┘        └──────────┬───────────┘       │
│           │                              │                   │
│           ▼                              ▼                   │
│  ┌──────────────────┐        ┌──────────────────────┐       │
│  │  Redis (Upstash) │        │  PostgreSQL          │       │
│  │  Caching + RL    │        │  (Supabase/Neon)     │       │
│  └──────────────────┘        └──────────────────────┘       │
│                                          │                   │
│                              ┌──────────────────────┐       │
│                              │  S3 / Cloudinary     │       │
│                              │  Media Storage       │       │
│                              └──────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Monorepo Structure

```
/madhuban-garden/
├── apps/
│   ├── web/                    ← Next.js frontend (existing app, modified)
│   │   ├── app/
│   │   │   ├── (pages)/        ← Unchanged frontend pages
│   │   │   └── api/            ← Business logic API routes
│   │   ├── components/         ← Unchanged
│   │   ├── lib/
│   │   │   ├── data.ts         ← Rewritten to call Strapi API
│   │   │   ├── strapi.ts       ← NEW: Strapi API client
│   │   │   ├── types.ts        ← Unchanged
│   │   │   ├── payments/       ← Unchanged
│   │   │   ├── email.ts        ← Unchanged
│   │   │   └── redis.ts        ← Unchanged
│   │   └── package.json
│   │
│   └── cms/                    ← NEW: Strapi 5 application
│       ├── config/
│       │   ├── admin.ts
│       │   ├── api.ts
│       │   ├── database.ts
│       │   ├── middlewares.ts
│       │   ├── plugins.ts
│       │   └── server.ts
│       ├── src/
│       │   ├── admin/          ← Custom admin extensions
│       │   │   └── app.tsx
│       │   ├── api/            ← Custom API routes
│       │   │   ├── dashboard/
│       │   │   └── availability/
│       │   ├── components/     ← Shared field components
│       │   ├── extensions/     ← Content-type extensions
│       │   ├── middlewares/
│       │   ├── plugins/
│       │   └── policies/
│       ├── public/
│       ├── types/
│       └── package.json
│
├── packages/
│   └── shared/                 ← Shared types/utilities (optional)
│       ├── types.ts
│       └── constants.ts
│
├── scripts/
│   ├── migrate-data.ts         ← Data migration script
│   ├── migrate-media.ts        ← Media migration script
│   └── seed-strapi.ts          ← Seed script
│
├── turbo.json                  ← Turborepo config
├── package.json                ← Root workspace
└── pnpm-workspace.yaml
```

### 2.3 Strapi Content-Types Design

```
apps/cms/src/api/
├── room/
│   ├── content-types/room/schema.json
│   ├── controllers/room.ts
│   ├── routes/room.ts
│   └── services/room.ts
├── booking/
│   ├── content-types/booking/schema.json
│   ├── controllers/booking.ts
│   ├── routes/booking.ts
│   ├── services/booking.ts
│   └── lifecycles/booking.ts
├── inquiry/
├── blocked-date/
├── gallery-item/
├── review/
├── site-content/              ← Single Type
├── payment-config/            ← Single Type
├── wedding-page/              ← Single Type (NEW — moves from hardcoded)
├── banquet-page/              ← Single Type (NEW)
├── pool-page/                 ← Single Type (NEW)
├── events-page/               ← Single Type (NEW)
├── attractions-page/          ← Single Type (NEW)
└── contact-page/              ← Single Type (NEW)
```

### 2.4 RBAC Roles

| Role | Strapi Type | Permissions |
|------|-------------|-------------|
| Super Admin | Built-in | Full access to everything |
| Resort Admin | Custom | All content CRUD, settings, no code/plugin access |
| Staff | Custom | Read all, Create/Update bookings+inquiries+gallery, no delete, no settings |
| API Consumer | Public | Read-only on rooms, reviews, gallery, site-content (frontend consumption) |

### 2.5 Plugin Strategy

| Plugin | Purpose | Required |
|--------|---------|----------|
| `@strapi/provider-upload-aws-s3` | S3-compatible media storage | Yes |
| `@strapi/plugin-users-permissions` | Built-in auth + roles | Yes (built-in) |
| `@strapi/plugin-graphql` | Optional GraphQL layer | Optional |
| `strapi-plugin-import-export-entries` | Data import/export | Migration |
| `strapi-plugin-config-sync` | Sync config across environments | Yes |
| `strapi-plugin-ckeditor` or blocks editor | Rich text for room descriptions | Yes |
| `strapi-plugin-responsive-image` | Auto-generate image sizes | Yes |

### 2.6 Environment Handling

```env
# apps/cms/.env

# Database
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://...

# Server
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...

# Media
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_BUCKET=madhuban-media
AWS_ENDPOINT=https://...supabase.co/storage/v1/s3

# Frontend URL (for CORS + webhooks)
FRONTEND_URL=https://madhubangarden.com

# API Token for Next.js (read-only content access)
STRAPI_API_TOKEN=...
```

```env
# apps/web/.env.local

# Strapi connection
STRAPI_URL=https://cms.madhubangarden.com
STRAPI_API_TOKEN=...

# Existing services (unchanged)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
RESEND_API_KEY=...
ADMIN_EMAIL=...

# Payment credentials (moved FROM database TO env)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
PHONEPE_CLIENT_ID=...
# ... etc
```

---

## 3. Content Modeling Strategy

### 3.1 Rooms

**Payload → Strapi Mapping:**

```json
// apps/cms/src/api/room/content-types/room/schema.json
{
  "kind": "collectionType",
  "collectionName": "rooms",
  "info": {
    "singularName": "room",
    "pluralName": "rooms",
    "displayName": "Room",
    "description": "Hotel room inventory"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "type": {
      "type": "enumeration",
      "enum": ["standard", "deluxe", "suite"],
      "required": true
    },
    "description": {
      "type": "blocks"
    },
    "price_per_night": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "capacity": {
      "type": "integer",
      "required": true,
      "min": 1
    },
    "bed_type": {
      "type": "string"
    },
    "room_size": {
      "type": "string"
    },
    "amenities": {
      "type": "json",
      "description": "Array of amenity strings"
    },
    "images": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    "is_active": {
      "type": "boolean",
      "default": true
    }
  }
}
```

**Improvements over Payload:**

| Aspect | Payload | Strapi |
|--------|---------|--------|
| Slug | Manual text field | Auto-generated UID from name |
| Draft/Publish | Not available | Built-in draft system |
| Image handling | Upload relation (hasMany) | Native multi-media field |
| Description | Lexical JSON (complex) | Blocks editor (simpler, flexible) |
| Amenities | Array of objects `[{amenity: "WiFi"}]` | JSON array `["WiFi", "AC"]` (simpler) |

**Admin UX improvements:**
- Drag-and-drop image reordering built into media field
- Auto-slug generation from room name
- Draft preview before publishing
- Version history via draft/publish workflow

### 3.2 Bookings

```json
{
  "kind": "collectionType",
  "collectionName": "bookings",
  "info": {
    "singularName": "booking",
    "pluralName": "bookings",
    "displayName": "Booking"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "guest_name": { "type": "string", "required": true },
    "guest_phone": { "type": "string", "required": true },
    "guest_email": { "type": "email", "required": true },
    "room": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::room.room"
    },
    "check_in": { "type": "date", "required": true },
    "check_out": { "type": "date", "required": true },
    "guests_count": { "type": "integer", "required": true, "min": 1 },
    "payment_method": {
      "type": "enumeration",
      "enum": ["online", "at_reception"],
      "required": true
    },
    "payment_status": {
      "type": "enumeration",
      "enum": ["pending", "paid", "failed", "refunded"],
      "default": "pending"
    },
    "total_amount": { "type": "decimal", "min": 0 },
    "gateway_used": {
      "type": "enumeration",
      "enum": ["razorpay", "phonepe", "cashfree", "ccavenue", "payu"]
    },
    "gateway_order_id": { "type": "string" },
    "gateway_payment_id": { "type": "string" },
    "source": {
      "type": "enumeration",
      "enum": ["website", "booking_com", "mmt", "manual"],
      "default": "website"
    },
    "status": {
      "type": "enumeration",
      "enum": ["confirmed", "pending", "cancelled"],
      "default": "pending"
    }
  }
}
```

**Improvements:**
- `guest_email` uses Strapi's `email` type (built-in format validation)
- No need for computed `nights` field — calculate in the frontend/API layer
- Draft/publish disabled (operational data shouldn't have drafts)

**Lifecycle hook (replaces Payload afterRead hook):**

```typescript
// apps/cms/src/api/booking/lifecycles/booking.ts
export default {
  afterFindMany(event) {
    event.result.forEach(booking => {
      if (booking.check_in && booking.check_out) {
        const diffMs = new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()
        booking.nights = Math.max(1, Math.ceil(diffMs / 86400000))
      }
    })
  },
  afterFindOne(event) {
    const booking = event.result
    if (booking?.check_in && booking?.check_out) {
      const diffMs = new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()
      booking.nights = Math.max(1, Math.ceil(diffMs / 86400000))
    }
  }
}
```

### 3.3 Inquiries

```json
{
  "kind": "collectionType",
  "collectionName": "inquiries",
  "info": {
    "singularName": "inquiry",
    "pluralName": "inquiries",
    "displayName": "Inquiry"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "phone": { "type": "string", "required": true },
    "email": { "type": "email", "required": true },
    "event_type": {
      "type": "enumeration",
      "enum": ["wedding", "birthday", "corporate", "other"],
      "required": true
    },
    "event_date": { "type": "date" },
    "guests_count": { "type": "integer", "min": 1 },
    "message": { "type": "text" },
    "status": {
      "type": "enumeration",
      "enum": ["new", "contacted", "closed"],
      "default": "new"
    },
    "staff_notes": { "type": "text" }
  }
}
```

No changes needed — straightforward mapping.

### 3.4 BlockedDates

```json
{
  "kind": "collectionType",
  "collectionName": "blocked_dates",
  "info": {
    "singularName": "blocked-date",
    "pluralName": "blocked-dates",
    "displayName": "Blocked Date"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "room": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::room.room",
      "required": true
    },
    "date": { "type": "date", "required": true },
    "source": {
      "type": "enumeration",
      "enum": ["ical", "manual"],
      "default": "manual",
      "required": true
    },
    "ical_uid": { "type": "string" }
  }
}
```

### 3.5 Gallery

```json
{
  "kind": "collectionType",
  "collectionName": "gallery_items",
  "info": {
    "singularName": "gallery-item",
    "pluralName": "gallery-items",
    "displayName": "Gallery Item"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"],
      "required": true
    },
    "category": {
      "type": "enumeration",
      "enum": ["rooms", "wedding", "events", "pool", "restaurant"],
      "required": true
    },
    "caption": { "type": "string" },
    "sort_order": { "type": "integer", "default": 0 }
  }
}
```

**Improvement:** Draft/publish enabled — editors can prepare gallery items and publish in batches.

### 3.6 Reviews

```json
{
  "kind": "collectionType",
  "collectionName": "reviews",
  "info": {
    "singularName": "review",
    "pluralName": "reviews",
    "displayName": "Review"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "guest_name": { "type": "string", "required": true },
    "rating": { "type": "integer", "required": true, "min": 1, "max": 5 },
    "review_text": { "type": "text", "required": true },
    "source": {
      "type": "enumeration",
      "enum": ["google", "manual"],
      "default": "manual",
      "required": true
    }
  }
}
```

**Improvement:** `is_published` checkbox is replaced by Strapi's native draft/publish. Published = visible on frontend. Draft = hidden. This is more intuitive for editors.

### 3.7 Site Content (Single Type)

```json
{
  "kind": "singleType",
  "collectionName": "site_contents",
  "info": {
    "singularName": "site-content",
    "pluralName": "site-contents",
    "displayName": "Site Content"
  },
  "attributes": {
    "tagline": { "type": "string" },
    "hero_heading": { "type": "string" },
    "hero_subtext": { "type": "text" },
    "wedding_heading": { "type": "string" },
    "wedding_description": { "type": "text" },
    "contact_phone": { "type": "string" },
    "contact_email": { "type": "email" },
    "contact_address": { "type": "text" },
    "whatsapp_number": { "type": "string" },
    "instagram_url": { "type": "string" },
    "facebook_url": { "type": "string" },
    "bookingcom_ical_url": { "type": "string" },
    "mmt_ical_url": { "type": "string" }
  }
}
```

**Design decision:** Flatten the nested groups from Payload (hero/wedding/contact/social/ical) into a flat Single Type. Strapi's admin auto-groups fields with components if needed, but flat structure is simpler for this small config.

### 3.8 Payment Config (Single Type)

**Recommendation: MOVE TO ENVIRONMENT VARIABLES.**

The PaymentConfig global currently stores secrets in the database. This is a security antipattern. In the Strapi architecture:

- `active_gateway` → Strapi Single Type (admin can switch)
- `{gateway}_enabled` → Strapi Single Type (admin can toggle)
- **All credentials** → Environment variables on the Next.js side
- `{gateway}_environment` (sandbox/production) → Environment variables

This means the PaymentConfig Single Type becomes:

```json
{
  "kind": "singleType",
  "collectionName": "payment_configs",
  "info": {
    "singularName": "payment-config",
    "pluralName": "payment-configs",
    "displayName": "Payment Settings"
  },
  "attributes": {
    "active_gateway": {
      "type": "enumeration",
      "enum": ["razorpay", "phonepe", "cashfree", "ccavenue", "payu"],
      "required": true,
      "default": "razorpay"
    },
    "razorpay_enabled": { "type": "boolean", "default": false },
    "phonepe_enabled": { "type": "boolean", "default": false },
    "cashfree_enabled": { "type": "boolean", "default": false },
    "ccavenue_enabled": { "type": "boolean", "default": false },
    "payu_enabled": { "type": "boolean", "default": false }
  }
}
```

Credentials stay in `apps/web/.env.local` — the Next.js API routes read them at request time. Admin can still toggle which gateway is active via Strapi, but secrets never touch the database.

### 3.9 NEW: Page Content Single Types

Moving `lib/page-content.ts` into the CMS:

```json
// Wedding Page Single Type
{
  "kind": "singleType",
  "collectionName": "wedding_pages",
  "info": { "singularName": "wedding-page", "pluralName": "wedding-pages", "displayName": "Wedding Page" },
  "attributes": {
    "hero_eyebrow": { "type": "string" },
    "hero_title": { "type": "string" },
    "hero_subtitle": { "type": "text" },
    "hero_image": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "overview_title": { "type": "string" },
    "overview_description": { "type": "richtext" },
    "overview_image": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "overview_stats": { "type": "json" },
    "services": { "type": "component", "repeatable": true, "component": "shared.icon-feature" },
    "gallery": { "type": "media", "multiple": true, "allowedTypes": ["images"] },
    "reasons": { "type": "component", "repeatable": true, "component": "shared.icon-feature" },
    "inquiry_title": { "type": "string" },
    "inquiry_description": { "type": "text" }
  }
}
```

Similar Single Types for: Banquet Page, Pool Page, Events Page, Attractions Page, Contact Page.

**Shared component:**

```json
// src/components/shared/icon-feature.json
{
  "collectionName": "components_shared_icon_features",
  "info": {
    "displayName": "Icon Feature",
    "icon": "star"
  },
  "attributes": {
    "icon": { "type": "string", "required": true },
    "title": { "type": "string", "required": true },
    "description": { "type": "text" }
  }
}
```

---

## 4. Admin UX Planning

### 4.1 Navigation Structure

```
Strapi Admin Sidebar:
├── 📊 Dashboard (custom plugin)
├── Content Manager
│   ├── 🏨 Rooms (Collection)
│   ├── 📅 Bookings (Collection)
│   ├── 💬 Inquiries (Collection)
│   ├── 🖼️ Gallery (Collection)
│   ├── ⭐ Reviews (Collection)
│   ├── 🚫 Blocked Dates (Collection)
│   ├── ─────────────────
│   ├── 🏠 Site Content (Single Type)
│   ├── 💳 Payment Settings (Single Type)
│   ├── 💒 Wedding Page (Single Type)
│   ├── 🎉 Banquet Page (Single Type)
│   ├── 🏊 Pool Page (Single Type)
│   ├── 🎈 Events Page (Single Type)
│   ├── 🗺️ Attractions Page (Single Type)
│   └── 📞 Contact Page (Single Type)
├── 📁 Media Library
├── 👤 Users & Permissions
└── ⚙️ Settings
```

### 4.2 Dashboard Strategy

Build a custom Strapi admin plugin that replicates the existing KPI dashboard:

```typescript
// apps/cms/src/plugins/resort-dashboard/admin/src/pages/HomePage.tsx
// Custom dashboard with:
// - Today's check-ins/check-outs
// - Occupancy rate
// - Revenue summary
// - Pending inquiries count
// - Quick links to create booking/room
```

The dashboard plugin queries Strapi's own API internally (authenticated via admin session). This solves the current security gap where `/api/dashboard` is unauthenticated.

### 4.3 Plugin Recommendations

| Plugin | Purpose | Priority |
|--------|---------|----------|
| `strapi-plugin-config-sync` | Sync schema/config between environments | High |
| `@strapi/provider-upload-aws-s3` | S3-compatible media storage | High |
| Custom dashboard plugin | Resort KPIs | High |
| `strapi-plugin-import-export-entries` | Bulk data operations | Medium |
| `strapi-plugin-responsive-image` | Auto-generate thumbnails/responsive sizes | Medium |

### 4.4 Workflow Improvements

**Current pain points (Payload):**
- No draft system → publish mistakes are live immediately
- No content preview → editors can't see changes before publishing
- Custom dashboard is a client component fetching an unauthenticated API

**Strapi improvements:**
- Built-in draft/publish on Rooms, Gallery, Reviews
- Preview mode: configure preview URLs that link to Next.js draft mode
- Authenticated dashboard within admin panel
- Content versioning via draft states
- Bulk publish/unpublish in list views
- Better media library with folder organization

### 4.5 Preview Configuration

```typescript
// apps/cms/config/admin.ts
export default ({ env }) => ({
  // ...
  preview: {
    enabled: true,
    config: {
      'api::room.room': {
        url: `${env('FRONTEND_URL')}/api/preview?type=room&slug={slug}`,
      },
    },
  },
})
```

---

## 5. Frontend Compatibility Strategy

### 5.1 API Client Layer

Create a new Strapi client that replaces Payload Local API calls:

```typescript
// apps/web/lib/strapi.ts
import 'server-only'

const STRAPI_URL = process.env.STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN!

type StrapiResponse<T> = {
  data: T
  meta?: { pagination?: { total: number; page: number; pageSize: number } }
}

export async function strapiGet<T>(
  path: string,
  params?: Record<string, string>,
  options?: { revalidate?: number; tags?: string[] },
): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    next: {
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    },
  })

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText}`)
  }

  const json: StrapiResponse<T> = await res.json()
  return json.data
}
```

### 5.2 Rewritten `lib/data.ts`

```typescript
// apps/web/lib/data.ts
import 'server-only'
import { strapiGet } from './strapi'
import type { SiteContent, RoomData, ReviewData, GalleryItemData } from './types'

// Types remain IDENTICAL — only the data source changes

function normalizeRoom(doc: any): RoomData {
  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.name,
    type: doc.type,
    description: extractBlocksText(doc.description),
    price_per_night: doc.price_per_night,
    capacity: doc.capacity,
    bed_type: doc.bed_type || '',
    room_size: doc.room_size || '',
    amenities: doc.amenities || [],
    images: (doc.images || []).map((img: any) => img.url),
    is_active: doc.is_active ?? true,
  }
}

function normalizeReview(doc: any): ReviewData {
  return {
    id: doc.id,
    guest_name: doc.guest_name,
    rating: doc.rating,
    review_text: doc.review_text,
    createdAt: doc.createdAt,
  }
}

function normalizeGalleryItem(doc: any): GalleryItemData {
  return {
    id: doc.id,
    src: doc.image?.url || '',
    alt: doc.image?.alternativeText || doc.caption || '',
    caption: doc.caption || '',
    category: doc.category,
    sort_order: doc.sort_order || 0,
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const data = await strapiGet<any>('/site-content', {
      // No populate needed — flat fields
    }, { revalidate: 300, tags: ['site-content'] })

    return {
      name: 'Madhuban Garden Resort',
      tagline: data.tagline || 'The most peaceful & lush green premises...',
      hero_heading: data.hero_heading || 'Madhuban Garden Resort',
      hero_subtext: data.hero_subtext || '',
      wedding_heading: data.wedding_heading || '',
      wedding_description: data.wedding_description || '',
      phone: data.contact_phone || '',
      email: data.contact_email || '',
      address: data.contact_address || '',
      whatsapp: data.whatsapp_number || '',
      instagram: data.instagram_url || '',
      facebook: data.facebook_url || '',
    }
  } catch {
    return defaultSiteContent
  }
}

export async function getRooms(): Promise<RoomData[]> {
  try {
    const data = await strapiGet<any[]>('/rooms', {
      'filters[is_active][$eq]': 'true',
      'populate': 'images',
      'sort': 'price_per_night:asc',
      'pagination[limit]': '100',
      'publicationState': 'live',
    }, { revalidate: 60, tags: ['rooms'] })

    return data.map(normalizeRoom)
  } catch {
    return []
  }
}

export async function getRoomBySlug(slug: string): Promise<RoomData | null> {
  try {
    const data = await strapiGet<any[]>('/rooms', {
      'filters[slug][$eq]': slug,
      'populate': 'images',
      'pagination[limit]': '1',
    }, { revalidate: 60, tags: ['rooms', `room-${slug}`] })

    if (!data.length) return null
    return normalizeRoom(data[0])
  } catch {
    return null
  }
}

export async function getReviews(): Promise<ReviewData[]> {
  try {
    const data = await strapiGet<any[]>('/reviews', {
      'sort': 'createdAt:desc',
      'pagination[limit]': '50',
      'publicationState': 'live',
    }, { revalidate: 120, tags: ['reviews'] })

    return data.map(normalizeReview)
  } catch {
    return []
  }
}

export async function getGallery(category?: string): Promise<GalleryItemData[]> {
  try {
    const params: Record<string, string> = {
      'populate': 'image',
      'sort': 'sort_order:asc',
      'pagination[limit]': '100',
      'publicationState': 'live',
    }
    if (category && category !== 'all') {
      params['filters[category][$eq]'] = category
    }

    const data = await strapiGet<any[]>('/gallery-items', params, {
      revalidate: 120,
      tags: ['gallery'],
    })

    return data.map(normalizeGalleryItem)
  } catch {
    return []
  }
}
```

### 5.3 Key Insight: Zero Frontend Component Changes

Because `lib/types.ts` remains unchanged and `lib/data.ts` continues to export the same function signatures returning the same types, **no frontend components need any modification**.

The migration boundary is:
```
[Components] ←(unchanged)→ [lib/types.ts] ←(unchanged)→ [lib/data.ts] ←(CHANGED)→ [Strapi API]
```

### 5.4 REST vs GraphQL Recommendation

**Recommendation: REST API with `populate` parameter.**

Rationale:
- Strapi REST is simpler, better documented, and more performant for this use case
- All queries are simple (filter by slug, filter by category, sort)
- No complex nested queries that would benefit from GraphQL
- REST integrates better with Next.js `fetch` caching (tag-based revalidation)
- GraphQL adds unnecessary complexity for 7 simple query functions

### 5.5 Caching & Revalidation Strategy

```typescript
// Tag-based on-demand revalidation
// When admin updates content in Strapi, a webhook fires to:
// POST /api/revalidate?tag=rooms&secret=...

// apps/web/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')
  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  return NextResponse.json({ error: 'Missing tag' }, { status: 400 })
}
```

**Strapi webhook configuration:**
- On Room create/update/delete → POST to `/api/revalidate?tag=rooms`
- On Review publish/unpublish → POST to `/api/revalidate?tag=reviews`
- On Gallery publish → POST to `/api/revalidate?tag=gallery`
- On Site Content update → POST to `/api/revalidate?tag=site-content`

This gives near-instant content updates without polling or short TTLs.

---

## 6. Data Migration Planning

### 6.1 Migration Order

```
Phase 1: Schema (no data)
  1. Deploy Strapi with all content-types defined
  2. Configure media storage (same S3 bucket)
  3. Set up RBAC roles

Phase 2: Content data (read-only period)
  4. Migrate Media entries (preserve URLs)
  5. Migrate Rooms (with image relations)
  6. Migrate Gallery items
  7. Migrate Reviews
  8. Migrate Site Content global → Single Type
  9. Migrate Inquiries (historical)
  10. Migrate BlockedDates
  11. Migrate Bookings (critical — last before cutover)

Phase 3: Cutover
  12. Switch Next.js data layer from Payload → Strapi
  13. Update API routes to use Strapi for booking creation
  14. Verify payment webhooks still work
  15. Decommission Payload
```

### 6.2 Migration Script Architecture

```typescript
// scripts/migrate-data.ts
import { getPayload } from 'payload'
import payloadConfig from '../apps/web/payload.config'

async function migrateRooms() {
  const payload = await getPayload({ config: payloadConfig })
  const rooms = await payload.find({ collection: 'rooms', limit: 100 })

  for (const room of rooms.docs) {
    // Map Payload room → Strapi room format
    const strapiRoom = {
      data: {
        name: room.name,
        slug: room.slug,
        type: room.type,
        description: convertLexicalToBlocks(room.description),
        price_per_night: room.price_per_night,
        capacity: room.capacity,
        bed_type: room.bed_type,
        room_size: room.room_size,
        amenities: (room.amenities || []).map(a => a.amenity),
        is_active: room.is_active,
        // Images handled separately (media migration)
      }
    }

    await fetch(`${STRAPI_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify(strapiRoom),
    })
  }
}
```

### 6.3 Rich Text Migration

**Payload Lexical JSON → Strapi Blocks format:**

```typescript
function convertLexicalToBlocks(lexicalData: any): any[] {
  if (!lexicalData?.root?.children) return []

  return lexicalData.root.children.map((node: any) => {
    if (node.type === 'paragraph') {
      return {
        type: 'paragraph',
        children: node.children.map((child: any) => ({
          type: 'text',
          text: child.text || '',
          bold: child.format?.includes('bold'),
          italic: child.format?.includes('italic'),
        })),
      }
    }
    if (node.type === 'heading') {
      return {
        type: 'heading',
        level: parseInt(node.tag?.replace('h', '') || '2'),
        children: node.children.map((child: any) => ({
          type: 'text',
          text: child.text || '',
        })),
      }
    }
    // Default: extract plain text as paragraph
    return {
      type: 'paragraph',
      children: [{ type: 'text', text: extractText(node) }],
    }
  })
}
```

### 6.4 User Migration

| Payload | Strapi |
|---------|--------|
| Users collection (email/password, role) | `admin::user` for admin panel access |
| `admin` role | Strapi Super Admin or custom Resort Admin |
| `staff` role | Strapi custom Staff role |

Strapi uses a separate auth system for admin users. Passwords cannot be directly migrated (different hashing). Users will need new passwords set in Strapi.

### 6.5 Rollback Strategy

1. **Keep Payload running in read-only mode** during migration (disable writes)
2. **Both systems read from the same PostgreSQL** — Strapi gets its own schema/tables
3. **Feature flag in Next.js** — `USE_STRAPI=true` env var switches `lib/data.ts` between Payload and Strapi
4. If Strapi has issues, flip the flag back to Payload within seconds
5. Only decommission Payload after 7 days of successful Strapi operation

---

## 7. Media Migration Strategy

### 7.1 Approach: Keep Same S3 Bucket

**Decision:** Point Strapi at the SAME Supabase S3 bucket. Do NOT re-upload.

Rationale:
- Media URLs remain unchanged
- No broken image links
- No bandwidth cost for re-upload
- Supabase Storage is S3-compatible, works with `@strapi/provider-upload-aws-s3`

### 7.2 Media Entry Migration

Strapi's media library stores metadata in the `files` table. We need to create Strapi media entries that point to existing S3 objects:

```typescript
async function migrateMedia() {
  const payload = await getPayload({ config: payloadConfig })
  const mediaItems = await payload.find({ collection: 'media', limit: 1000 })

  for (const item of mediaItems.docs) {
    // Create Strapi file entry pointing to existing S3 object
    await strapi.db.query('plugin::upload.file').create({
      data: {
        name: item.filename,
        alternativeText: item.alt || '',
        url: item.url,
        provider: 'aws-s3',
        provider_metadata: {
          public_id: item.filename,
        },
        mime: item.mimeType || 'image/jpeg',
        size: item.filesize || 0,
        width: item.width || null,
        height: item.height || null,
        hash: item.filename.split('.')[0],
        ext: `.${item.filename.split('.').pop()}`,
      },
    })
  }
}
```

### 7.3 Image Optimization Strategy

**Add responsive image sizes in Strapi:**

```typescript
// apps/cms/config/plugins.ts
export default {
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        params: { Bucket: process.env.AWS_BUCKET },
        endpoint: process.env.AWS_ENDPOINT,
        s3ForcePathStyle: true,
      },
      breakpoints: {
        xlarge: 1920,
        large: 1200,
        medium: 750,
        small: 500,
        thumbnail: 250,
      },
    },
  },
}
```

This auto-generates responsive variants on upload — solving the current gap where Payload had no image sizes configured.

### 7.4 Frontend Image Rendering

After migration, `normalizeRoom()` can return responsive image data:

```typescript
images: (doc.images || []).map((img: any) => ({
  url: img.url,
  formats: img.formats, // { thumbnail, small, medium, large, xlarge }
}))
```

But to minimize frontend changes initially, continue returning just the URL string. Responsive images can be a follow-up improvement.

---

## 8. API & Business Logic Migration

### 8.1 Decision: Where Does Business Logic Live?

| Route | Current (Payload) | Recommended (Strapi) | Reason |
|-------|-------------------|---------------------|--------|
| `GET /api/availability` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (Redis caching logic) |
| `POST /api/bookings` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (email, Redis, validation) |
| `POST /api/payments/order` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (gateway logic) |
| `POST /api/payments/webhooks/*` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (signature verification) |
| `POST /api/inquiry` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (email, rate limiting) |
| `POST /api/cron/sync-ical` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (QStash verification) |
| `GET /api/ical/export` | Next.js → Payload Local API | Next.js → Strapi REST API | Stays in Next.js (iCal generation) |
| `GET /api/dashboard` | Next.js → Payload Local API | **Strapi custom controller** | Moves to Strapi (authenticated) |
| `GET /api/front-desk` | Next.js → Payload Local API | **Strapi custom controller** | Moves to Strapi (authenticated) |

**Key decision:** All public-facing business logic stays in Next.js API routes. Only admin-internal APIs move to Strapi custom controllers.

### 8.2 Booking Flow Migration

```typescript
// apps/web/app/api/bookings/route.ts (AFTER migration)
// Changes only the data access calls — logic remains identical

export async function POST(request: NextRequest) {
  // ... validation, rate limiting unchanged ...

  // BEFORE: const payload = await getPayload({ config })
  // AFTER:
  const strapiToken = process.env.STRAPI_ADMIN_TOKEN

  // Check availability via Strapi
  const overlapping = await fetch(
    `${STRAPI_URL}/api/bookings?` + new URLSearchParams({
      'filters[room][id][$eq]': room_id,
      'filters[status][$in][0]': 'confirmed',
      'filters[status][$in][1]': 'pending',
      'filters[check_in][$lt]': check_out,
      'filters[check_out][$gt]': check_in,
      'pagination[limit]': '1',
    }),
    { headers: { Authorization: `Bearer ${strapiToken}` } }
  )

  // Create booking via Strapi
  const booking = await fetch(`${STRAPI_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${strapiToken}`,
    },
    body: JSON.stringify({
      data: {
        room: room_id,
        guest_name, guest_phone, guest_email,
        check_in, check_out, guests_count,
        payment_method: 'at_reception',
        payment_status: 'pending',
        status: 'pending',
        source: 'website',
        total_amount: totalAmount,
      }
    }),
  })

  // ... email, cache invalidation unchanged ...
}
```

### 8.3 Payment Gateway Logic

**No changes to the payment gateway abstraction.** The `lib/payments/` directory is completely CMS-independent. Only the `resolve-gateway.ts` needs a minor update:

```typescript
// BEFORE (reads from Payload global):
export async function getPaymentConfig(): Promise<PaymentConfigData> {
  const payload = await getPayload({ config })
  const data = await payload.findGlobal({ slug: 'payment-config' })
  return data as unknown as PaymentConfigData
}

// AFTER (reads gateway selection from Strapi, credentials from env):
export async function getPaymentConfig(): Promise<PaymentConfigData> {
  const res = await fetch(`${process.env.STRAPI_URL}/api/payment-config`, {
    headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
    next: { revalidate: 60 },
  })
  const { data } = await res.json()

  return {
    active_gateway: data.active_gateway,
    razorpay_enabled: data.razorpay_enabled,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,
    razorpay_webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
    phonepe_enabled: data.phonepe_enabled,
    phonepe_client_id: process.env.PHONEPE_CLIENT_ID,
    // ... etc — credentials from env, toggles from Strapi
  }
}
```

### 8.4 Dashboard API (Moves to Strapi)

```typescript
// apps/cms/src/api/dashboard/routes/dashboard.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/dashboard/metrics',
      handler: 'dashboard.getMetrics',
      config: {
        policies: ['admin::isAuthenticatedAdmin'], // AUTHENTICATED
      },
    },
  ],
}

// apps/cms/src/api/dashboard/controllers/dashboard.ts
export default {
  async getMetrics(ctx) {
    const { start, end } = ctx.query
    // ... same aggregation logic, using strapi.db.query() ...
    ctx.body = { /* same response shape */ }
  },
}
```

This solves the current security gap: dashboard metrics are now behind Strapi admin authentication.

---

## 9. Security Improvements

### 9.1 Dashboard Authentication (FIXED)

| Before | After |
|--------|-------|
| `GET /api/dashboard` — unauthenticated, public | Strapi custom route with `admin::isAuthenticatedAdmin` policy |

The dashboard component in Strapi's admin panel makes authenticated requests using the admin session cookie. External access is impossible.

### 9.2 Payment Credentials (FIXED)

| Before | After |
|--------|-------|
| All secrets in PostgreSQL (PaymentConfig global) | Secrets in environment variables only |
| Accessible to anyone with DB read access | Only accessible to the Next.js runtime |
| Admin can see secrets in the CMS panel | Admin sees toggle switches only, not credentials |

### 9.3 API Permissions Design

```
Strapi Roles & Permissions:

Public (unauthenticated):
  ├── rooms: find, findOne (published only)
  ├── reviews: find (published only)
  ├── gallery-items: find (published only)
  ├── site-content: find
  ├── wedding-page: find
  ├── banquet-page: find
  ├── pool-page: find
  ├── events-page: find
  ├── attractions-page: find
  └── contact-page: find

API Token (Next.js backend):
  ├── All public permissions PLUS:
  ├── bookings: find, findOne, create, update
  ├── blocked-dates: find, create, delete
  ├── inquiries: create
  ├── payment-config: find
  └── rooms: find (including unpublished, for availability)

Admin:
  └── Full access (managed via Strapi admin panel)
```

### 9.4 CORS Configuration

```typescript
// apps/cms/config/middlewares.ts
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        process.env.FRONTEND_URL,           // https://madhubangarden.com
        'http://localhost:3000',             // Local dev
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      headers: ['Content-Type', 'Authorization'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
```

### 9.5 API Token Strategy

| Token | Scope | Used By |
|-------|-------|---------|
| Read-only API token | Public content (rooms, reviews, gallery, pages) | Next.js `lib/data.ts` (public pages) |
| Full-access API token | All content CRUD | Next.js API routes (bookings, payments, cron) |
| Admin JWT | Admin panel access | Strapi admin users only |

Two separate tokens ensure that if the read-only token leaks, no mutations are possible.

---

## 10. Deployment & Infrastructure Strategy

### 10.1 Recommended Stack

| Component | Service | Reason |
|-----------|---------|--------|
| Next.js frontend | Vercel | Already deployed there, excellent DX |
| Strapi CMS | Railway or Render | Persistent Node.js server, auto-deploy from git |
| PostgreSQL | Supabase (existing) | Keep existing DB, add Strapi tables to same instance |
| Media storage | Supabase S3 (existing) | Keep same bucket, same URLs |
| Redis | Upstash (existing) | Unchanged |
| Cron | QStash (existing) | Unchanged |
| Email | Resend (existing) | Unchanged |

### 10.2 Why NOT Vercel for Strapi?

Strapi requires a persistent Node.js server with:
- Writable filesystem (for admin panel build)
- Persistent process (not serverless)
- WebSocket support (admin real-time)

Vercel's serverless functions cannot host Strapi. Railway/Render provide $5-20/mo persistent containers with auto-deploy.

### 10.3 Database Strategy

**Option A (Recommended): Same Supabase PostgreSQL instance, separate schema.**

```sql
-- Strapi creates its own tables alongside Payload's
-- Payload tables: rooms, bookings, inquiries, etc. (prefixed or in public schema)
-- Strapi tables: strapi_rooms, strapi_bookings, etc. (or in 'strapi' schema)
```

Benefits:
- No new database to manage
- Migration scripts can directly read from Payload tables and write to Strapi tables
- Single connection string

**Option B: Separate database.**

Use if concerned about schema conflicts. Strapi gets its own Supabase project or Neon database.

### 10.4 CI/CD

```yaml
# .github/workflows/deploy-cms.yml
name: Deploy Strapi
on:
  push:
    branches: [main]
    paths: ['apps/cms/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          service: madhuban-cms
          root: apps/cms
```

```yaml
# .github/workflows/deploy-web.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['apps/web/**']

# Vercel auto-deploys from git — no explicit workflow needed
# But we can add a check:
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd apps/web && npm ci && npm run build
```

### 10.5 Domain Architecture

| URL | Service |
|-----|---------|
| `madhubangarden.com` | Next.js on Vercel |
| `cms.madhubangarden.com` | Strapi admin panel |
| `api.madhubangarden.com` | Strapi content API (optional — can use CMS domain) |

---

## 11. Migration Execution Plan

### Phase 0: Preparation (Week 1)

- [ ] Set up monorepo with Turborepo
- [ ] Initialize Strapi 5 in `apps/cms/`
- [ ] Configure Strapi to use existing Supabase PostgreSQL
- [ ] Configure S3 upload provider pointing to existing bucket
- [ ] Set up RBAC roles (Super Admin, Resort Admin, Staff)
- [ ] Deploy Strapi to Railway (staging)
- [ ] Verify Strapi admin panel is accessible

### Phase 1: Content Modeling (Week 1-2)

- [ ] Create all collection types (Room, Booking, Inquiry, BlockedDate, GalleryItem, Review)
- [ ] Create all single types (SiteContent, PaymentConfig, WeddingPage, BanquetPage, PoolPage, EventsPage, AttractionsPage, ContactPage)
- [ ] Create shared components (IconFeature, etc.)
- [ ] Configure permissions for Public and API Token roles
- [ ] Set up API tokens (read-only + full-access)
- [ ] Test all CRUD operations via REST API

### Phase 2: Frontend Adaptation (Week 2-3)

- [ ] Create `lib/strapi.ts` API client
- [ ] Rewrite `lib/data.ts` to use Strapi REST API
- [ ] Add feature flag: `NEXT_PUBLIC_CMS=strapi|payload`
- [ ] Test all frontend pages render correctly with Strapi data
- [ ] Set up webhook-based revalidation (`/api/revalidate`)
- [ ] Configure Strapi webhooks for content changes
- [ ] Verify SSG/ISR works correctly

### Phase 3: API Route Migration (Week 3-4)

- [ ] Update `/api/availability` to query Strapi
- [ ] Update `/api/bookings` to create via Strapi
- [ ] Update `/api/payments/order` to use Strapi
- [ ] Update all payment webhooks to update via Strapi
- [ ] Update `/api/inquiry` to create via Strapi
- [ ] Update `/api/cron/sync-ical` to use Strapi
- [ ] Update `/api/ical/export` to query Strapi
- [ ] Move dashboard logic to Strapi custom controller
- [ ] Update `lib/payments/resolve-gateway.ts`

### Phase 4: Data Migration (Week 4)

- [ ] Write and test migration scripts
- [ ] Run media migration (metadata sync to Strapi `files` table)
- [ ] Run Rooms migration
- [ ] Run Gallery migration
- [ ] Run Reviews migration
- [ ] Populate all Single Types with content
- [ ] Migrate page content from `lib/page-content.ts` to CMS
- [ ] Run Inquiries migration
- [ ] Run BlockedDates migration
- [ ] Create admin/staff users in Strapi

### Phase 5: Testing & Validation (Week 4-5)

- [ ] End-to-end booking flow test (pay at reception)
- [ ] End-to-end booking flow test (online payment with Razorpay)
- [ ] Payment webhook verification test
- [ ] iCal sync cron test
- [ ] Gallery display test
- [ ] Room pages + SEO metadata test
- [ ] Mobile responsiveness check
- [ ] Admin panel workflow test (create room, edit content, manage bookings)
- [ ] Performance comparison (Strapi API response times vs Payload Local API)

### Phase 6: Cutover (Week 5)

- [ ] **15 minutes before cutover:** Put Payload admin in read-only mode
- [ ] Run final Bookings migration (catch any new bookings since Phase 4)
- [ ] Flip `NEXT_PUBLIC_CMS=strapi` on Vercel
- [ ] Deploy Next.js with Strapi data layer
- [ ] Verify all pages load correctly
- [ ] Test a real booking (pay at reception)
- [ ] Verify payment webhooks arrive and process correctly
- [ ] Monitor error logs for 24 hours

### Phase 7: Cleanup (Week 6)

- [ ] Remove Payload dependencies from `apps/web/package.json`
- [ ] Remove `payload.config.ts`
- [ ] Remove `collections/` directory
- [ ] Remove `globals/` directory
- [ ] Remove `src/access/` directory
- [ ] Remove `components/admin/` (Payload-specific)
- [ ] Remove `app/(payload)/` route group
- [ ] Remove feature flag
- [ ] Drop Payload tables from PostgreSQL (after 7-day grace period)
- [ ] Update CLAUDE.md documentation

### Timeline Summary

| Phase | Duration | Parallel? |
|-------|----------|-----------|
| Phase 0: Preparation | 3 days | - |
| Phase 1: Content Modeling | 4 days | - |
| Phase 2: Frontend Adaptation | 5 days | Can overlap Phase 1 |
| Phase 3: API Route Migration | 5 days | After Phase 2 |
| Phase 4: Data Migration | 3 days | After Phase 1 |
| Phase 5: Testing | 4 days | After Phase 3 + 4 |
| Phase 6: Cutover | 1 day | After Phase 5 |
| Phase 7: Cleanup | 2 days | After Phase 6 |
| **Total** | **~5-6 weeks** | |

### Fallback Strategy

At any point during Phases 2-5, the system can revert to Payload by:
1. Setting `NEXT_PUBLIC_CMS=payload` on Vercel (instant rollback)
2. No data loss — both systems share the same PostgreSQL instance
3. Payload remains functional until explicitly decommissioned in Phase 7

---

## 12. Final Recommendation

### Should You Actually Migrate?

**Honest assessment:**

#### Arguments FOR Migration (Strapi)

| Gain | Impact |
|------|--------|
| Better editor UX | Medium — Strapi's content manager is more polished for non-technical editors |
| Draft/publish workflow | Medium — prevents accidental live changes |
| CMS-editable page content | High — moves wedding/banquet/pool pages from code to CMS |
| Security fix (dashboard auth) | High — resolves critical vulnerability |
| Security fix (payment secrets) | Medium — moves credentials out of database |
| Larger ecosystem & community | Low — more plugins, more tutorials |
| Decoupled architecture | Medium — frontend and CMS deploy independently |
| Image size variants | Medium — automatic responsive images |
| Webhook-based revalidation | Medium — instant content updates vs stale cache |

#### Arguments AGAINST Migration

| Loss | Impact |
|------|--------|
| Payload Local API speed | High — in-process calls become network requests (+10-50ms per query) |
| Single deployment simplicity | Medium — now managing 2 services instead of 1 |
| Tight TypeScript integration | Medium — Payload auto-generates types; Strapi needs manual sync |
| Cost increase | Low — Railway/Render adds $5-20/month for Strapi hosting |
| Migration effort | High — 5-6 weeks of focused work |
| Risk of bugs during transition | Medium — payment/booking flow is business-critical |
| Embedded admin convenience | Low — `/admin` on same domain vs separate `cms.` subdomain |

### Verdict

**The migration is MODERATELY justified** for this project, primarily because:

1. **The page content hardcoding problem** is the strongest motivator — 774 lines of marketing content frozen in code that the client can't edit without a developer. Strapi fixes this with Single Types.

2. **The security gaps** (unauthenticated dashboard, credentials in DB) are real issues that need fixing regardless of CMS choice. They COULD be fixed in Payload too, but a migration presents a natural opportunity.

3. **The editor UX** difference is meaningful for a resort team that is non-technical.

However:

4. **If the primary motivation is just "better admin"** — Payload v3's admin is already quite capable, and the custom dashboard/views already built represent significant investment.

5. **The performance regression** from Local API → network REST calls is real. Every page that fetches CMS data adds latency.

6. **The monorepo + two-service complexity** is a permanent architectural cost.

### Alternative: Fix Issues in Payload

If the goal is to address specific pain points without full migration:

| Issue | Fix in Payload (effort) |
|-------|------------------------|
| Page content in code | Create Payload globals for each page (2 days) |
| Dashboard auth | Add Payload session cookie check to `/api/dashboard` (1 hour) |
| Payment secrets in DB | Move to env vars, keep PaymentConfig for toggles only (4 hours) |
| No revalidation | Add `revalidateTag` calls in Payload afterChange hooks (2 hours) |
| No image sizes | Add `imageSizes` to Media collection config (30 minutes) |
| No drafts | Enable Payload versions on Rooms/Gallery/Reviews (1 hour) |

**Total to fix all issues in Payload: ~3 days vs 5-6 weeks for Strapi migration.**

### Final Recommendation

**Proceed with Strapi migration ONLY if:**
- The client has expressed dissatisfaction with the current admin UX
- The team wants long-term CMS independence (agency may hand off to another team)
- There's budget and timeline for 5-6 weeks of dedicated migration work
- The performance regression (network API vs local API) is acceptable

**Stay on Payload if:**
- The current admin works well enough for the team
- Speed of page rendering is a priority
- The project is stable and doesn't need frequent content updates from non-technical editors
- Budget is constrained

---

## Appendix: Quick Reference

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Strapi hosting | Railway/Render (separate) | Strapi needs persistent server |
| API protocol | REST with fetch caching | Simpler than GraphQL for this use case |
| Monorepo | Yes (Turborepo) | Shared types, coordinated deploys |
| Database | Same Supabase instance | Simplifies migration, reduces cost |
| Media | Same S3 bucket | Preserves all URLs |
| Payment secrets | Environment variables | Security improvement |
| Business logic | Stays in Next.js API routes | Already working, CMS-independent |
| Dashboard | Strapi custom plugin | Solves auth gap |
| Page content | Strapi Single Types | Enables non-technical editing |
| Revalidation | Webhook-triggered tag invalidation | Near-instant updates |

### Files That Change

```
MODIFIED:
  lib/data.ts           ← Rewritten (Payload Local API → Strapi REST)
  lib/payments/resolve-gateway.ts  ← Gateway config from env + Strapi
  app/api/availability/route.ts    ← Strapi queries instead of Payload
  app/api/bookings/route.ts        ← Strapi queries instead of Payload
  app/api/payments/order/route.ts  ← Strapi queries instead of Payload
  app/api/payments/webhooks/*.ts   ← Strapi updates instead of Payload
  app/api/inquiry/route.ts         ← Strapi create instead of Payload
  app/api/cron/sync-ical/route.ts  ← Strapi queries instead of Payload
  app/api/ical/export/route.ts     ← Strapi queries instead of Payload
  package.json                     ← Remove Payload deps

NEW:
  lib/strapi.ts         ← Strapi API client utility
  app/api/revalidate/route.ts  ← On-demand revalidation endpoint
  apps/cms/             ← Entire Strapi application

DELETED:
  payload.config.ts
  collections/          ← Entire directory
  globals/              ← Entire directory
  src/access/           ← Entire directory
  components/admin/     ← Entire directory (Payload admin components)
  app/(payload)/        ← Entire route group

UNCHANGED:
  lib/types.ts
  lib/payments/ (except resolve-gateway.ts)
  lib/email.ts
  lib/redis.ts
  lib/page-content.ts   ← Kept as fallback, eventually removed
  lib/room-helpers.ts
  lib/utils.ts
  lib/motion.ts
  components/ (all frontend components)
  app/(pages)/ (all pages)
  components/ui/ (shadcn)
  tailwind.config.ts
  public/
```
