# Antigravity Prompts — Madhuban Garden Resort
# Phase 2+ (UI complete, backend starts here)
# Run in Planning Mode. One prompt at a time.

---

## SETUP BEFORE STARTING

Ensure these files are in project root:
```
/madhubangarden/
├── CLAUDE.md              ← Claude auto-loads this
├── PRD-madhuban-garden.md
└── /app/(frontend)/       ← existing UI (done)
```

---

## PHASE 2 — BACKEND & CMS

---

### Prompt 1 — Payload CMS v3 Setup

```
Read CLAUDE.md and PRD-madhuban-garden.md fully before starting.

Install and configure Payload CMS v3 into this existing Next.js 14 project.

1. Install Payload v3:
npx create-payload-app@latest (select "add to existing" option)
OR manually:
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical

2. Create payload.config.ts in project root:
- db: postgresAdapter using DATABASE_URI from env
- admin: { user: 'users' }
- collections: import all from /collections folder (create empty placeholders for now)
- secret: PAYLOAD_SECRET from env
- typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') }

3. Update next.config.js to wrap with withPayload()

4. Create /app/(payload)/admin/[[...segments]]/page.tsx — Payload admin route
Create /app/(payload)/admin/[[...segments]]/not-found.tsx
Create /app/(payload)/layout.tsx — Payload layout (no site navbar/footer)

5. Create /collections/Users.ts:
- Fields: name, email, role (admin/staff)
- Auth: true
- Admin: useAsTitle = 'name'

6. Add env variables:
DATABASE_URI= (Supabase PostgreSQL connection string — use Transaction Pooler URL)
PAYLOAD_SECRET= (generate a random 32-char string)

7. Run: npx payload generate:types

Verify: npm run dev → visit /admin → Payload login screen should appear.
Create first admin user. Confirm /admin loads without errors.
```

---

### Prompt 2 — All Payload Collections

```
Read CLAUDE.md.

Create all Payload collections as defined in CLAUDE.md.
Each collection goes in /collections/ as a separate file.

Collections to create:

1. Rooms.ts
- slug (text, unique, required), name (text), type (select: Standard/Deluxe/Suite)
- description (richText using Lexical), price_per_night (number), capacity (number)
- bed_type (text), room_size (text)
- amenities (array of text)
- images (upload, hasMany: true, relationTo: 'media')
- is_active (checkbox, defaultValue: true)
- Admin: useAsTitle = 'name', defaultColumns: [name, type, price_per_night, is_active]

2. Bookings.ts
- room (relationship → rooms), guest_name, guest_phone, guest_email (all text, required)
- check_in, check_out (date fields), guests_count (number)
- payment_method (select: online/at_reception)
- payment_status (select: pending/paid/failed/refunded, defaultValue: pending)
- razorpay_order_id, razorpay_payment_id (text, optional)
- source (select: website/booking_com/mmt/manual, defaultValue: website)
- status (select: confirmed/pending/cancelled, defaultValue: pending)
- total_amount (number)
- Admin: defaultColumns: [guest_name, room, check_in, check_out, status, payment_status]

3. Inquiries.ts
- name, phone, email (text, required)
- event_type (select: wedding/birthday/corporate/other)
- event_date (date), guests_count (number), message (textarea)
- status (select: new/contacted/closed, defaultValue: new)
- Admin: defaultColumns: [name, event_type, event_date, status, createdAt]

4. BlockedDates.ts
- room (relationship → rooms), date (date, required)
- source (select: ical/manual), ical_uid (text, optional)

5. Gallery.ts
- image (upload, relationTo: 'media', required)
- category (select: rooms/wedding/events/pool/restaurant)
- caption (text), sort_order (number, defaultValue: 0)

6. Reviews.ts
- guest_name (text), rating (number, min: 1, max: 5)
- review_text (textarea), source (select: google/manual)
- is_published (checkbox, defaultValue: false)

7. Content.ts
- This is a GLOBAL (not a collection) — only one instance
- Use payload globals for this
- Fields: tagline, hero_heading, hero_subtext,
  wedding_heading, wedding_description,
  contact_phone, contact_email, contact_address,
  whatsapp_number, instagram_url, facebook_url,
  bookingcom_ical_url, mmt_ical_url

Register all collections + the Content global in payload.config.ts.
Run: npx payload generate:types
Verify all collections appear in /admin with correct fields.
```

---

### Prompt 3 — Supabase Storage for Payload Media

```
Read CLAUDE.md.

Configure Payload to use Supabase Storage for all media uploads.

1. Install: npm install @payloadcms/storage-s3
(Supabase Storage is S3-compatible)

2. Configure in payload.config.ts:
- Add s3Storage plugin pointing to Supabase Storage bucket
- Bucket name: 'madhuban-media'
- S3 endpoint: your Supabase S3 endpoint
- Use SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL

3. Create the 'madhuban-media' bucket in Supabase Storage dashboard
- Set to public read access

4. Test: upload an image via /admin → verify it appears in Supabase Storage bucket → verify public URL works

Add env variables:
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_S3_ACCESS_KEY=
SUPABASE_S3_SECRET_KEY=
SUPABASE_S3_ENDPOINT=
SUPABASE_S3_BUCKET=madhuban-media

Verify image upload works end to end in /admin.
```

---

### Prompt 4 — Seed Initial Data

```
Read CLAUDE.md.

Seed initial data into Payload collections using the Payload Local API.
Create /scripts/seed.ts

Rooms (6):
1. Standard Room — ₹2,500/night, 2 guests, slug: standard-room
2. Deluxe Room — ₹3,500/night, 2 guests, slug: deluxe-room
3. Deluxe Double — ₹4,000/night, 3 guests, slug: deluxe-double
4. Family Suite — ₹5,500/night, 4 guests, slug: family-suite
5. Premium Suite — ₹7,000/night, 2 guests, slug: premium-suite
6. Honeymoon Suite — ₹8,500/night, 2 guests, slug: honeymoon-suite

Each room: realistic description 2-3 sentences, relevant amenities array, is_active: true

Reviews (5):
- Realistic Indian guest names, ratings 4-5, genuine review text about peaceful resort

Content Global (1):
- Populate with real resort content from CLAUDE.md
- whatsapp_number: placeholder for now
- bookingcom_ical_url: placeholder
- mmt_ical_url: placeholder

Add to package.json: "seed": "tsx scripts/seed.ts"
Install tsx if needed: npm install -D tsx
Run: npm run seed
Verify all data appears in /admin correctly.
```

---

### Prompt 5 — Replace Dummy Data with Payload Local API

```
Read CLAUDE.md.

Replace all dummy-data.ts usage across the frontend with real Payload Local API calls.

1. Create /lib/data.ts with these server-only functions:

getRooms() → payload.find rooms where is_active = true
getRoomBySlug(slug) → payload.find rooms where slug = slug
getFeaturedRooms() → payload.find rooms, limit 3, sort by price_per_night desc
getReviews() → payload.find reviews where is_published = true
getGallery(category?) → payload.find gallery, optionally filter by category, sort by sort_order
getSiteContent() → payload.findGlobal('content')

2. Update all pages to use /lib/data.ts:
- / (homepage) → getFeaturedRooms() + getReviews() + getSiteContent() for hero/tagline
- /rooms → getRooms()
- /rooms/[slug] → getRoomBySlug(slug) + notFound() if null
- /gallery → getGallery() with category filter
- All pages using tagline/contact info → getSiteContent()

3. generateStaticParams for /rooms/[slug] → getRooms() → map slugs

4. Add proper error handling:
- try/catch on all data functions
- Return empty array / null on error, never throw to client
- Add empty state UI if data is missing

5. Remove /lib/dummy-data.ts imports from all pages
(keep the file itself for reference but stop using it)

Verify every page loads real data from Payload/Supabase in browser.
```

---

### Prompt 6 — Availability API

```
Read CLAUDE.md.

Build the availability checking API and connect it to the booking widget.

1. Create /app/api/availability/route.ts:
GET /api/availability?room_id=&check_in=&check_out=

- Validate params with Zod: room_id required, valid ISO dates, check_in < check_out, not in past
- Use Payload Local API to query bookings:
  Find bookings where room = room_id AND status IN [confirmed, pending]
  AND check_in < requested check_out AND check_out > requested check_in
- Use Payload Local API to query blocked_dates:
  Find blocked_dates where room = room_id AND date between check_in and check_out
- Check Upstash Redis cache first (key: avail:{room_id}:{check_in}:{check_out}, TTL: 15min)
- Return: { available: boolean, blocked_dates: string[] }

2. Install @upstash/redis:
npm install @upstash/redis
Create /lib/redis.ts with Upstash client singleton

3. Connect to booking widget on /rooms/[slug]:
- On date selection → debounced call to /api/availability
- Loading state: show spinner in widget
- Available → green "Available" badge, enable Pay Now + Pay at Reception buttons
- Not available → red "Not Available", disable buttons, show "Try different dates"
- Price breakdown updates reactively:
  nights × price_per_night = subtotal
  subtotal × 12% = GST
  subtotal + GST = Total
  Show each line clearly

4. Date picker rules:
- Check-in: cannot select past dates
- Check-out: must be at least 1 day after check-in
- Blocked dates: visually disabled in date picker

Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to .env.local
Verify availability check works in browser end to end.
```

---

### Prompt 7 — Booking API + Pay at Reception

```
Read CLAUDE.md.

Build the Pay at Reception booking flow end to end.

1. Install resend: npm install resend
Create /lib/email.ts with:
- bookingConfirmationEmail(booking, room) → sends to guest
  Template: booking ID, room name, dates, total, "Amount to be paid at reception"
- Use Resend with RESEND_API_KEY

2. Create /app/api/bookings/route.ts:
POST /api/bookings

Zod schema: room_id, guest_name (min 2 chars), guest_phone (10 digit Indian),
guest_email (valid email), check_in, check_out, guests_count (min 1)
payment_method: 'at_reception'

Logic:
- Validate with Zod
- Re-check availability (always re-check server-side, never trust client)
- If not available → 409 { error: 'Room not available', code: 'UNAVAILABLE' }
- Calculate total: nights × price + 12% GST
- Create booking via Payload Local API: status pending, payment_status pending, source website
- Invalidate Redis cache for this room's availability
- Send confirmation email via Resend
- Return: { success: true, booking_id, total_amount }

3. Connect "Pay at Reception" button in booking widget:
- Guest details form: name, phone, email, guests count (collect before showing buttons)
- On click → POST /api/bookings with loading state on button
- Success → replace booking widget with confirmation card:
  Booking ID, Room Name, Dates, Total to pay at reception, "We'll contact you on [phone]"
- Error → toast notification with error message

4. Add rate limiting to POST /api/bookings:
Max 10 requests per IP per hour via Upstash Redis
Return 429 if exceeded

Add RESEND_API_KEY + ADMIN_EMAIL to .env.local
Verify full Pay at Reception flow in browser. Check email received.
```

---

### Prompt 8 — Razorpay Integration

```
Read CLAUDE.md fully before starting.

Before writing any code, read the official documentation for every 
payment gateway listed below. Do not rely on training data for SDK 
behavior, API signatures, hash/checksum logic, or webhook formats — 
these change. Read the docs, then plan, then build.

Razorpay: https://razorpay.com/docs/api/orders/ | https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/ | https://razorpay.com/docs/webhooks/
PhonePe: https://developer.phonepe.com/v1/docs/pay-page-integration-web | https://developer.phonepe.com/v1/docs/server-to-server-callback | https://developer.phonepe.com/v1/docs/checksum
Cashfree: https://docs.cashfree.com/docs/pg-new-apis-endpoint | https://docs.cashfree.com/docs/create-order | https://docs.cashfree.com/docs/webhooks
CCAvenue: https://developer.ccavenue.com/wiki/index.php/Seamless_Integration
PayU: https://devguide.payu.in/payment-gateway/server-side-integration/ | https://devguide.payu.in/payment-gateway/server-side-integration/hash-formula/

---

We need a fully working multi-gateway payment system for Madhuban Garden 
Resort where the admin can configure, enable/disable, and switch between 
payment gateways entirely from the Payload CMS admin panel — no code 
changes or redeployments required.

The admin panel needs a Payment Config global in Payload where the admin 
can set one gateway as the active default, and for each gateway they can 
toggle it on/off and enter all required credentials (keys, secrets, salts, 
merchant IDs — whatever each gateway actually requires per its docs). 
Secrets must never be exposed to the client under any circumstance.

The backend needs a clean gateway abstraction so all five gateways 
(Razorpay, PhonePe, Cashfree, CCAvenue, PayU) implement the same interface 
— create order, verify webhook signature, handle webhook event. The active 
gateway is resolved at runtime from the Payload config. If a gateway is set 
as active but credentials are missing or it's disabled, the system should 
fail with a clear human-readable error, not a crash.

The booking widget on /rooms/[slug] should work correctly for both 
JS-based gateways (Razorpay, Cashfree) and redirect/form-POST based 
gateways (PhonePe, CCAvenue, PayU). There should be a /booking/status 
page that handles post-redirect verification for gateways that don't 
support inline callbacks.

All five gateways need their own webhook endpoints, all running 
simultaneously regardless of which is currently active. On a successful 
payment the booking status updates, availability cache is invalidated, 
and confirmation email goes out via Resend.

Rate limit the order creation endpoint via Upstash Redis. All credentials 
must come from the Payload PaymentConfig global, not hardcoded env 
variables. Add a gateway_used field to the Bookings collection to track 
which gateway processed each transaction.

---

### Prompt 9 — Inquiry Forms

```
Read CLAUDE.md.

Connect both inquiry forms to a real backend.

1. Add to /lib/email.ts:
- adminInquiryNotification(inquiry) → email to ADMIN_EMAIL
  Subject: "New [event_type] Inquiry from [name]"
  Body: all inquiry details formatted cleanly
- guestInquiryAcknowledgement(inquiry) → email to guest
  Body: "We've received your inquiry and will contact you within 24 hours"

2. Create /app/api/inquiry/route.ts:
POST /api/inquiry

Zod schema: name (required), phone (10 digit), email (valid),
event_type (wedding/birthday/corporate/other),
event_date (optional), guests_count (optional), message (min 10 chars)

Logic:
- Validate with Zod
- Save to Inquiries collection via Payload Local API: status 'new'
- Send admin notification email via Resend
- Send guest acknowledgement email via Resend
- Return: { success: true }

Rate limit: 5 requests per IP per hour via Upstash Redis

3. Install react-hot-toast: npm install react-hot-toast
Add <Toaster position="top-right" /> to root layout

4. Connect /wedding inquiry form:
- On submit → POST /api/inquiry (event_type: wedding hardcoded)
- Loading spinner on submit button
- Success → replace form with thank you message: "Thank you [name]! We'll contact you within 24 hours."
- Error → toast notification

5. Connect /contact query form:
- On submit → POST /api/inquiry (event_type from dropdown)
- Same success/error handling

Verify both forms submit correctly. Verify admin receives email. Verify guest receives acknowledgement.
```

---

### Prompt 10 — iCal Sync Engine

```
Read CLAUDE.md.

Build the complete iCal sync engine for OTA channel management.

1. Install: npm install node-ical ical-generator

2. Create /app/api/ical/export/route.ts:
GET /api/ical/export?room_id= (optional)

Logic:
- Fetch confirmed bookings via Payload Local API
  If room_id provided → filter by room
  Else → fetch all rooms' confirmed bookings
- Generate iCal using ical-generator:
  Calendar name: 'Madhuban Garden Resort'
  Each booking → event:
    DTSTART: check_in date
    DTEND: check_out date
    SUMMARY: 'Booked'
    UID: booking.id + '@madhubangarden.com'
- Return Response with Content-Type: text/calendar
- Add Cache-Control: no-cache header

3. Create /app/api/cron/sync-ical/route.ts:
POST /api/cron/sync-ical

Logic:
- Check Authorization header: Bearer {CRON_SECRET} → 401 if missing/wrong
- Fetch Content global via Payload → get bookingcom_ical_url + mmt_ical_url
- For each URL:
  Fetch the iCal feed
  Parse with node-ical
  For each VEVENT:
    Extract UID, DTSTART, DTEND, room reference if available
    Upsert into blocked_dates via Payload (find by ical_uid → update or create)
  Remove stale entries: delete blocked_dates with source=ical whose ical_uid no longer exists in feed
- Update Redis:
  Set 'ical:last_sync' → ISO timestamp
  Set 'ical:bookingcom_count' → count
  Set 'ical:mmt_count' → count
- Return: { success: true, bookingcom_synced: N, mmt_synced: N, timestamp }

4. Create vercel.json in project root:
{
  "crons": [
    {
      "path": "/api/cron/sync-ical",
      "schedule": "*/30 * * * *"
    }
  ]
}

Add CRON_SECRET to .env.local

Verify:
- GET /api/ical/export returns valid .ics content in browser
- POST /api/cron/sync-ical with correct Authorization header returns success
- POST /api/cron/sync-ical without Authorization returns 401
```

---

### Prompt 11 — Security + Rate Limiting + Error Handling

```
Read CLAUDE.md.

Production hardening pass across the entire backend.

RATE LIMITING (Upstash Redis):
- POST /api/bookings → 10 requests per IP per hour
- POST /api/payments/order → 10 per IP per hour
- POST /api/inquiry → 5 per IP per hour
- Create /lib/rate-limit.ts with reusable rateLimit(ip, key, limit, window) function
- Return 429 { error: 'Too many requests', code: 'RATE_LIMITED' } when exceeded

ERROR HANDLING:
- All API routes return consistent format: { error: string, code: string } on failure
- All API routes return { success: true, data?: any } on success
- Add error.tsx to all major route groups
- Add not-found.tsx if not already present
- All Payload Local API calls wrapped in try/catch

SECURITY:
- Verify Razorpay webhook signature on every request (already done — double check)
- Verify CRON_SECRET on cron route (already done — double check)
- No RAZORPAY_KEY_SECRET or PAYLOAD_SECRET or DATABASE_URI exposed to client
- RAZORPAY_KEY_ID is the only Razorpay value safe for client (NEXT_PUBLIC_ prefix)
- Sanitize all inputs — Zod strips unknown fields on all schemas

LOADING STATES:
- All form submit buttons show spinner during API call, disabled to prevent double submit
- Booking widget shows skeleton while checking availability
- All pages that fetch data have loading.tsx

Create .env.example with all variables from CLAUDE.md (empty values + one-line comment per key).

After all done — report summary of all API routes, all env variables needed, and any remaining TODOs.
```

---

### Prompt 12 — Go Live Checklist + Final Testing

```
Read CLAUDE.md.

Final pre-launch pass. After this prompt the site is ready to go live.

REAL CONTENT (via Payload /admin — do manually, not in code):
- Update Content global: real phone, real WhatsApp number, real email, real address
- Upload real resort photos to Media library
- Update room images (replace placeholders)
- Set all rooms is_active = true
- Publish all reviews
- Update Razorpay keys from test to live

END-TO-END TEST CHECKLIST:
Run through every flow in browser and verify:
- [ ] Homepage loads real data (rooms, reviews, content)
- [ ] /rooms shows all 6 rooms
- [ ] /rooms/[slug] loads individual room
- [ ] Availability check works (try available + unavailable dates)
- [ ] Pay at Reception: select room → fill details → submit → email received
- [ ] Razorpay: select room → pay → test card → booking confirmed → email received
- [ ] Wedding inquiry form → submit → admin email received → guest ack received
- [ ] Contact form → submit → same
- [ ] GET /api/ical/export → returns valid .ics in browser
- [ ] POST /api/cron/sync-ical with correct secret → returns success
- [ ] /admin login → OTP → dashboard → all collections visible
- [ ] Upload image via /admin → appears in Supabase Storage
- [ ] Edit Content global → change tagline → homepage shows new tagline

VERCEL DEPLOYMENT:
- Add all env variables to Vercel dashboard (Settings → Environment Variables)
- Deploy to Vercel: vercel --prod
- Add custom domain: madhubangarden.com → Vercel DNS settings
- Verify SSL is active
- Verify /admin loads on live domain
- Verify Vercel Cron is active (Vercel dashboard → Cron Jobs tab)

Create GO_LIVE_CHECKLIST.md Artifact summarizing:
- All URLs (site, admin, iCal export)
- All env variables with descriptions
- How to add a new room (step by step for client)
- How to view bookings (step by step for client)
- How to manually block dates
- OTA setup instructions: how to add iCal URL to Booking.com + MMT extranets
```

---

## HOW TO RUN IN CLAUDE CODE

1. Open project in Claude Code
2. CLAUDE.md in .claude/ — auto-loaded
3. Select Planning Mode
4. Paste one prompt → review plan → approve → execute
5. Verify in browser after each prompt
6. Move to next only when current is fully working
