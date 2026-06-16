# Madhuban Garden Resort — Go-Live Checklist

## Site URLs

| URL | Purpose |
|-----|---------|
| `madhubangarden.com` | Public website |
| `madhubangarden.com/admin` | Custom admin panel |
| `madhubangarden.com/admin/login` | Staff login |
| `madhubangarden.com/api/ical/export` | iCal feed for OTA sync |
| `madhubangarden.com/api/ical/export?room_id=<id>` | Per-room iCal feed |

---

## Environment Variables

Add all of these to **Vercel → Project Settings → Environment Variables**.

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | Supabase PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `SUPABASE_S3_BUCKET` | Supabase S3 bucket name (e.g. `madhuban-media`) |
| `SUPABASE_S3_ACCESS_KEY` | Supabase S3 access key for media uploads |
| `SUPABASE_S3_SECRET_KEY` | Supabase S3 secret key |
| `SUPABASE_S3_ENDPOINT` | Supabase S3 endpoint URL |
| `NEXT_PUBLIC_SERVER_URL` | Full deployment URL (e.g. `https://madhubangarden.com`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limiting + caching) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash signing key — current (from Upstash dashboard → QStash → API Keys) |
| `QSTASH_NEXT_SIGNING_KEY` | QStash signing key — next (key rotation) |
| `RESEND_API_KEY` | Resend email service API key |
| `ADMIN_EMAIL` | Admin email address for booking and inquiry notifications |

### Payment gateway credentials

Payment gateway credentials (Razorpay, PhonePe, Cashfree, CCAvenue, or PayU) are **not set as Vercel env vars**. They are stored in the `payment_config` database table and configured entirely through the admin panel at `/admin/settings/payment`. Only the active gateway needs credentials entered; the others can be left blank.

### Optional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key (optional, for the map on the Contact page) |

---

## Content Setup (via /admin)

### 1. Site Identity and Contact Info (`/admin/settings/site`)
- [ ] Set resort name
- [ ] Set real phone number
- [ ] Set real email address
- [ ] Set full postal address
- [ ] Set WhatsApp number (with country code, e.g. `919876543210`)
- [ ] Set Instagram URL
- [ ] Set Facebook URL

### 2. Page Content (`/admin/content`)
Go to `/admin/content`, then click each page to edit its hero image, heading, subtext, and SEO fields:
- [ ] Homepage — hero image, hero heading, tagline, CTA text and link
- [ ] Rooms — banner image, page heading, page description, SEO title/description
- [ ] Wedding — hero image, heading, description, gallery images, packages text
- [ ] Banquet — hero image, heading, description, capacity info, features list
- [ ] Pool — hero image, heading, description, timings, rules
- [ ] Events — hero image, heading, description, event types
- [ ] Attractions — hero image, heading, description, attractions list
- [ ] Gallery — hero image, heading, description
- [ ] Contact — hero image, heading, phone, email, address, WhatsApp, map embed
- [ ] Header — logo, nav links, CTA button text and link
- [ ] Footer — about text, social links, contact info, copyright text

### 3. OTA iCal Feed URLs (`/admin/channel-manager`)
- [ ] Paste Booking.com iCal export URL into the Booking.com field
- [ ] Paste MakeMyTrip iCal export URL into the MakeMyTrip field

### 4. Rooms (`/admin/rooms`)
- [ ] Create all room entries with real details (name, slug, type, price per night, capacity, bed type, room size)
- [ ] Upload real room photos to each room's images field
- [ ] Set `is_active = true` on all rooms you want to display on the public site

### 5. Gallery (`/admin/gallery`)
- [ ] Upload resort photos with appropriate categories (rooms, wedding, events, pool, restaurant)
- [ ] Add captions and set sort order

### 6. Reviews (`/admin/reviews`)
- [ ] Add guest reviews (name, rating, text, source)
- [ ] Set `is_published = true` for every review you want shown on the homepage

### 7. Payment Config (`/admin/settings/payment`)
- [ ] Select the active payment gateway
- [ ] Enter the gateway's API credentials (key ID, secret, webhook secret, etc.)
- [ ] Switch the gateway from sandbox/test mode to production/live mode
- [ ] Test a real transaction end-to-end before go-live

---

## How to Add a New Room

1. Go to `/admin/rooms` → click **New Room**
2. Fill in: slug (URL-friendly, e.g. `garden-deluxe`), name, type, price per night, capacity, bed type, room size
3. Add amenities (click **Add Amenity** for each item)
4. Upload room images via the images field
5. Set **is_active** to `true`
6. Click **Save**
7. The room will appear on `/rooms` and get its own page at `/rooms/{slug}`

---

## How to View and Manage Bookings

1. Go to `/admin/bookings`
2. Use the filter bar to search by guest name, phone, email, date range, status, or source
3. Click any row to open the full booking detail (guest info, dates, payment history)
4. Update status inline (confirmed, checked-in, cancelled, etc.)
5. Use **Export CSV** to download a filtered list

---

## How to Manually Block Dates

1. Go to `/admin/calendar`
2. The calendar grid shows all rooms (Y-axis) across dates (X-axis)
3. Click a cell to block that date for that room
4. Set the reason if prompted (manual block, maintenance, etc.)
5. The date turns gray and becomes unavailable for online bookings immediately

---

## OTA iCal Sync Setup

### Give your iCal feed to OTAs

1. Copy your export URL: `https://madhubangarden.com/api/ical/export`
2. Log in to **Booking.com Extranet** → Rates & Availability → Sync Calendars → paste the URL
3. Log in to **MakeMyTrip Extranet** → Calendar → Sync → paste the URL

### Pull OTA availability into your calendar

1. From **Booking.com Extranet** → Sync Calendars → copy their iCal export URL
2. From **MakeMyTrip Extranet** → Calendar → copy their iCal feed URL
3. Go to `/admin/channel-manager`
4. Paste the URLs into the respective fields and save
5. The system syncs automatically approximately every 30 minutes — Upstash QStash sends a signed POST to `/api/cron/sync-ical`, which verifies the QStash signing keys before processing. No manual action is required after initial setup.

---

## E2E Test Checklist

Run through these after deploying to the live domain:

- [ ] Homepage loads real data (rooms, reviews, page content from the database)
- [ ] `/rooms` shows all active rooms with real images
- [ ] `/rooms/[slug]` loads individual room with images and pricing
- [ ] Availability check works — try both available and unavailable dates
- [ ] Pay at Reception flow: select room → fill guest details → submit → confirmation email received
- [ ] Online Payment flow: select room → pay via the configured active gateway → order created → webhook or callback fires → booking confirmed → Resend confirmation email received
- [ ] Wedding inquiry form → submit → admin notification email + guest acknowledgement email received
- [ ] Contact form → submit → admin notification email + guest acknowledgement email received
- [ ] `GET /api/ical/export` → returns valid `.ics` content in browser
- [ ] A valid QStash-signed POST to `/api/cron/sync-ical` → returns `{ success: true }` with sync counts
- [ ] An unsigned or incorrectly signed POST to `/api/cron/sync-ical` → returns 401
- [ ] `/admin/login` → enter staff credentials → redirected to dashboard → modules visible match the logged-in user's RBAC role
- [ ] Upload image via `/admin/gallery` → file appears in Supabase Storage
- [ ] Edit a page via `/admin/content` → change the hero heading → public page reflects the new text

---

## Vercel Deployment

1. Add all required env variables to **Vercel → Project Settings → Environment Variables** (Production environment)
2. Verify build passes locally first: `npm run build`
3. Deploy to production: `vercel --prod`
4. Add custom domain: `madhubangarden.com` → Vercel → Project → Domains
5. Verify SSL certificate is active (HTTPS on the live domain)
6. Verify `/admin` loads and login works on the live domain
7. Verify the QStash schedule is active in the **Upstash dashboard → QStash** — it should show a scheduled job pointing to `https://madhubangarden.com/api/cron/sync-ical`
8. Run through the full E2E test checklist above on the live domain
