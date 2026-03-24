# PRD — Madhuban Garden Resort Website
# Version 2.0 — Phase 2+ (UI Complete)

**Agency:** Xternal Media
**Client:** Madhuban Garden Resort, Agar Malwa District, MP
**Domain:** madhubangarden.com

---

## 1. Status

Phase 1 (frontend UI with dummy data) is complete and approved.
This PRD covers Phase 2 onwards.

---

## 2. Architecture

Single Next.js 14 project deployed on Vercel.
Payload CMS v3 installed as a plugin — generates /admin automatically.
No separate hosting, no separate server, no separate deployment.

```
madhubangarden.com          → resort website (Next.js frontend)
madhubangarden.com/admin    → CMS admin panel (Payload v3)
                            ↓
                    Supabase PostgreSQL (single DB)
                    Supabase Storage (media)
```

---

## 3. CMS — Payload v3

Payload replaces:
- Custom admin dashboard (was ~1 week to build)
- Supabase Auth
- Prisma ORM
- Manual CRUD API routes for content

Payload provides out of the box:
- /admin panel with full UI
- Role-based auth (admin + staff roles)
- Rich text editor for room descriptions, wedding content
- Media library with Supabase Storage adapter
- Auto-generated Local API for all collections
- Draft/publish workflow
- Audit logs

### Collections

| Collection | Purpose |
|---|---|
| Rooms | All room data, pricing, images, amenities |
| Bookings | All booking records (website + manual entry) |
| Inquiries | Wedding, birthday, corporate inquiries |
| BlockedDates | Dates blocked via iCal or manually |
| Gallery | Resort photo gallery by category |
| Reviews | Guest reviews (Google + manual) |
| Content | Site-wide editable content (headings, contact info, iCal URLs) |

---

## 4. Booking System

### Pay at Reception Flow
1. Guest selects room + dates
2. Availability check → /api/availability
3. Guest fills details (name, phone, email, guests)
4. POST /api/bookings → saved with status: pending
5. Confirmation email via Resend

### Pay Now Flow (Razorpay)
1. Same steps 1–3
2. POST /api/payments/order → Razorpay order created
3. Razorpay checkout opens (UPI, cards, net banking)
4. Payment success → webhook → /api/payments/webhook
5. Booking updated to confirmed + paid
6. Confirmation email via Resend

### Pricing
- Subtotal = nights × price_per_night
- GST = subtotal × 12%
- Total = subtotal + GST

---

## 5. iCal OTA Sync

No paid channel manager. DIY iCal sync.

- **Export:** GET /api/ical/export → .ics feed → given to Booking.com + MMT extranets
- **Import:** POST /api/cron/sync-ical → Vercel Cron every 30 min → pulls both OTA feeds → upserts blocked_dates
- **Cache:** Availability cached in Upstash Redis (15 min TTL), invalidated on new booking

---

## 6. Email Notifications

Via Resend (free 3k/mo):

| Trigger | Recipients |
|---|---|
| Booking confirmed (pay at reception) | Guest |
| Booking confirmed (Razorpay paid) | Guest |
| New inquiry submitted | Admin + Guest |
| Booking cancelled | Guest |

---

## 7. Admin Panel (Payload /admin)

Resort staff accesses madhubangarden.com/admin:

- **Rooms** — add/edit rooms, rich text, upload images
- **Bookings** — view all, filter, update status, add manual bookings
- **Inquiries** — view, mark as contacted/closed
- **Gallery** — upload, categorize, reorder
- **Reviews** — add, publish/unpublish
- **Content** — edit tagline, headings, contact details, iCal URLs
- **Media** — full media library
- **Users** — manage staff logins + roles

---

## 8. Phase Plan

### Phase 2 — Backend (Weeks 1–2)
- Payload v3 setup + all collections
- Replace dummy data with Payload Local API
- Availability API
- Booking API (pay at reception)
- Razorpay integration
- Resend email notifications
- Inquiry form backend

### Phase 3 — Sync + Hardening (Week 3)
- iCal sync engine
- Vercel Cron setup
- Upstash Redis caching + rate limiting
- Security hardening

### Phase 4 — Go Live (Week 4)
- Real content entry via Payload admin
- Real resort photos uploaded
- DNS switch to Vercel
- End-to-end testing
- Client handoff + admin training

---

## 9. Cost Summary

| Item | Cost |
|---|---|
| Vercel | ₹0 |
| Supabase (DB + Storage) | ₹0 |
| Payload CMS v3 | ₹0 (open source) |
| Upstash Redis | ₹0 |
| Resend | ₹0 |
| Razorpay | 2% per transaction |
| **Total monthly** | **₹0** |