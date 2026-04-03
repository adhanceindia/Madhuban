# Madhuban Garden Resort — Go-Live Checklist

## Site URLs

| URL | Purpose |
|-----|---------|
| `madhubangarden.com` | Public website |
| `madhubangarden.com/admin` | Payload CMS admin panel |
| `madhubangarden.com/api/ical/export` | iCal feed for OTA sync |
| `madhubangarden.com/api/ical/export?room_id=<id>` | Per-room iCal feed |

---

## Environment Variables

Add all of these to **Vercel → Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | Supabase PostgreSQL connection string |
| `PAYLOAD_SECRET` | Random secret for Payload CMS session encryption |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `SUPABASE_S3_ACCESS_KEY` | S3 storage access key for media uploads |
| `SUPABASE_S3_SECRET_KEY` | S3 storage secret key |
| `SUPABASE_S3_ENDPOINT` | Supabase S3 endpoint URL |
| `SUPABASE_S3_BUCKET` | S3 bucket name (e.g. `madhuban-media`) |
| `RAZORPAY_KEY_ID` | Razorpay key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook verification secret |
| `RESEND_API_KEY` | Resend email service API key |
| `ADMIN_EMAIL` | Admin email for booking/inquiry notifications |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for rate limiting + caching |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `CRON_SECRET` | Secret for verifying Vercel Cron requests |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key (optional, for maps) |

---

## Content Setup (via /admin)

### 1. Content Global (Settings → Content)
- [ ] Set real phone number
- [ ] Set real email address
- [ ] Set full address
- [ ] Set WhatsApp number (with country code, e.g. `919876543210`)
- [ ] Set Instagram URL
- [ ] Set Facebook URL
- [ ] Set hero tagline and heading
- [ ] Set wedding section heading and description

### 2. OTA Settings (Settings → Content → OTA Settings tab)
- [ ] Paste Booking.com iCal export URL
- [ ] Paste MakeMyTrip iCal export URL

### 3. Rooms (Main → Rooms)
- [ ] Create all room entries with real details (name, slug, type, price, capacity, bed type, size, amenities)
- [ ] Upload real room photos to each room's images field
- [ ] Set `is_active = true` for all rooms to display

### 4. Gallery (Main → Gallery)
- [ ] Upload resort photos with categories (rooms, wedding, events, pool, restaurant)
- [ ] Add captions and sort order

### 5. Reviews (Main → Reviews)
- [ ] Add guest reviews (name, rating, text)
- [ ] Set `is_published = true` for reviews to show on homepage

### 6. Payment Config (Settings → Payment Config)
- [ ] Select active payment gateway
- [ ] Enter gateway credentials
- [ ] Switch from test/sandbox to production mode

---

## How to Add a New Room

1. Go to `/admin` → **Main → Rooms** → **Create New**
2. Fill in: slug (URL-friendly, e.g. `garden-deluxe`), name, type, price per night, capacity, bed type, room size
3. Add amenities (click "Add Amenity" for each)
4. Upload room images via the images field
5. Set **is_active** to `true`
6. Click **Save**
7. The room will appear on `/rooms` and get its own page at `/rooms/{slug}`

---

## How to View Bookings

1. Go to `/admin` → **Main → Bookings**
2. Search by guest name, phone, or email
3. Click any booking to see full details (guest info, dates, payment status)
4. Use the tabs: Guest Info, Booking Details, Payment Info

---

## How to Manually Block Dates

1. Go to `/admin` → **Management → Blocked Dates** → **Create New**
2. Select the **Room**
3. Pick the **Date** to block
4. Set **Source** to "Manual"
5. Click **Save**
6. Repeat for each date you want to block
7. Blocked dates will prevent bookings on the website

---

## OTA iCal Sync Setup

### Give your iCal feed to OTAs:
1. Copy your export URL: `https://madhubangarden.com/api/ical/export`
2. Go to **Booking.com Extranet** → Rates & Availability → Sync Calendars → paste the URL
3. Go to **MakeMyTrip Extranet** → Calendar → Sync → paste the URL

### Pull OTA availability into your calendar:
1. From **Booking.com Extranet** → Sync Calendars → copy their iCal export URL
2. From **MakeMyTrip Extranet** → Calendar → copy their iCal feed URL
3. Go to `/admin` → Settings → Content → **OTA Settings** tab
4. Paste the URLs into the respective fields
5. The system syncs automatically every 30 minutes via Vercel Cron

---

## E2E Test Checklist

- [ ] Homepage loads real data (rooms, reviews, content from CMS)
- [ ] `/rooms` shows all active rooms
- [ ] `/rooms/[slug]` loads individual room with images
- [ ] Availability check works (try available + unavailable dates)
- [ ] Pay at Reception: select room → fill details → submit → confirmation email received
- [ ] Online Payment: select room → pay → test card → booking confirmed → email received
- [ ] Wedding inquiry form → submit → admin email + guest acknowledgement received
- [ ] Contact form → submit → admin email + guest acknowledgement received
- [ ] `GET /api/ical/export` → returns valid `.ics` content in browser
- [ ] `POST /api/cron/sync-ical` with correct `Authorization: Bearer {CRON_SECRET}` → returns success
- [ ] `POST /api/cron/sync-ical` without Authorization → returns 401
- [ ] `/admin` login → dashboard → all collections visible
- [ ] Upload image via `/admin` → appears in Supabase Storage
- [ ] Edit Content global → change tagline → homepage shows new tagline

---

## Vercel Deployment

1. Add all env variables to **Vercel → Project Settings → Environment Variables**
2. Deploy: `vercel --prod`
3. Add custom domain: `madhubangarden.com` → Vercel DNS settings
4. Verify SSL is active (HTTPS)
5. Verify `/admin` loads on the live domain
6. Verify Vercel Cron is active: **Vercel Dashboard → Cron Jobs** tab
7. Run through the E2E test checklist above on the live domain
