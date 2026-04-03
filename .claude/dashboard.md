Madhuban Garden Resort — Full Codebase Analysis
1. Codebase Overview
Stack: Next.js 15 + Payload CMS v3 + Supabase PostgreSQL + React 19 + Tailwind CSS 3.4 + shadcn/ui

Project structure:


app/
├── (pages)/          ← 11 public pages (resort website)
├── (payload)/        ← Payload CMS admin panel (/admin)
├── api/              ← 14 custom API routes
collections/          ← 8 Payload collections
globals/              ← 2 globals (Content, PaymentConfig)
components/           ← ~30 components organized by feature
lib/                  ← utilities + payments/ (11 gateway files)
src/access/           ← RBAC helpers (admin/staff roles)
Pages built out:
Home, Rooms (list + detail), Attractions, Events, Banquet, Pool, Wedding, Contact, Gallery, Booking Status — all under app/(pages)/.

2. Feature Inventory
Feature	Status	Key Files
Room Booking (Pay at Reception)	Complete	room-booking-widget.tsx, bookings/route.ts
Availability Check	Complete	availability/route.ts — Redis cached (15min TTL)
Razorpay Payments	Complete	lib/payments/razorpay.ts, webhooks/razorpay/route.ts
PhonePe Payments	Complete	lib/payments/phonepe.ts — OAuth + redirect flow
Cashfree Payments	Complete	lib/payments/cashfree.ts — JS checkout
CCAvenue Payments	Complete	lib/payments/ccavenue.ts — AES-128-CBC encrypted redirect
PayU Payments	Complete	lib/payments/payu.ts — SHA-512 hash redirect
Payment Confirmation Emails	Complete	lib/email.ts via Resend
Inquiry System	Complete	inquiry/route.ts — dual email (admin + guest)
Admin Dashboard Metrics	Complete	dashboard/route.ts — occupancy, revenue, trends
Rate Limiting	Complete	Redis-based on bookings (10/hr), inquiries (5/hr), payments (10/hr)
Booking Status Page	Complete	booking/status/page.tsx
Role-Based Access	Complete	src/access/index.ts — admin/staff roles
Multi-gateway Routing	Complete	resolve-gateway.ts + PaymentConfig.ts global
3. Incomplete, Broken, or Placeholder Features
iCal Sync — NOT IMPLEMENTED
The BlockedDates.ts collection has source: 'ical' and ical_uid fields ready, but there are no API routes for /api/ical/export or /api/cron/sync-ical. No vercel.json cron config exists. This is exactly what your selected prompt (from antigravity-prompts-phase2.md) is meant to build.

Wedding/Event Inquiry Forms — DUMMY SUCCESS
From dummy-data.ts:643: "submissions currently show a dummy success state only." The wedding page form shows client-side success but may not be wired to the /api/inquiry endpoint.

Google Maps — PLACEHOLDER
From dummy-data.ts:686: "Google Maps integration will be added in the final implementation." The NEXT_PUBLIC_GOOGLE_PLACES_API_KEY env var is empty.

Contact Form — UI ONLY
From dummy-data.ts:691: "This contact experience is UI-only for now and does not submit to a live backend."

Missing Env Vars (from .env.local):
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET — all empty
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN — all empty
CRON_SECRET — empty
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY — empty
Dummy Data Still Present
lib/dummy-data.ts (34.6 KB) remains as a fallback. Pages may still reference this instead of live Payload data.

4. Hardcoded Values That Should Be Dynamic
What	Where	Value	Should Be
GST rate	bookings/route.ts	0.12 (12%)	Configurable in PaymentConfig global
From email	email.ts	bookings@madhubangarden.com	Env var or Content global
Rate limits	Multiple API routes	10/hr, 5/hr	Configurable or env-based
Cache TTL	availability/route.ts	15 minutes	Configurable
5. Missing Features / Edge Cases
No booking cancellation API — bookings can only be cancelled manually in admin
No refund handling — no refund webhooks for any gateway
No payment retry — failed payments can't be retried
No seasonal/dynamic pricing — price_per_night is static
No multi-room bookings — single room per booking only
No audit trail — no tracking of who changed payment status
No webhook retry mechanism — failed webhook deliveries are lost
6. Color Theme & UI Analysis
Current Color Scheme
Defined in tailwind.config.ts + globals.css:

Token	Value	Usage
primary	#4CAF50	Green — intended main color
primary-dark	#2e7d32	Dark green
background	#f5f9f0	Cream/light green
secondary	#ecf4e6	Light green
border	#d6e4d0	Sage green
destructive	#b42318	Red
The Big Problem: Hardcoded Colors
84+ unique hardcoded hex colors across components, bypassing the token system:

Color	Occurrences	Used For
#356609	56 times	Icon colors, text — should be a text-primary-dark token
#386a0e	25 times	Button backgrounds
#ba7517	21 times	Gold/brown accent for CTAs & headings — not in any token
#fbf9f4	20 times	Section backgrounds
#d9e2cf	21 times	Borders
#eef4e7	13 times	Light green backgrounds
#a46612	11 times	Gold hover states
The tailwind config defines primary: #4CAF50, but components overwhelmingly use #356609 instead. There's also a gold/brown accent (#ba7517) used extensively for CTAs that has no token at all.

Dark Mode: Not Implemented
No dark: classes in components
No dark mode CSS variables
No theme provider/context
darkMode not configured in Tailwind
Fonts: Properly Tokenized
Display: Cormorant_Garamond (serif) via --font-display
Body: DM_Sans (sans) via --font-body
Loaded in layout.tsx, applied via Tailwind config
To Swap the Theme Globally:
Update the 13 CSS variables in globals.css
Then fix 84+ hardcoded hex values across components — this is the real work
Add gold/brown accent as a proper token (it's used 34+ times but has no token)
UI Inconsistencies:
3-4 different green shades used interchangeably (#4CAF50, #356609, #386a0e, #2e7d32)
3 different gold/brown shades (#ba7517, #a46612, #c2872d)
20+ off-white/cream variants for backgrounds that should be 2-3 tokens
Admin components use inline style objects instead of Tailwind classes
Hardcoded text-[0.65rem] / text-[0.68rem] breaks the typography scale
7. Recommendations (Prioritized)
Quick Wins
Wire up the contact form to /api/inquiry — the backend already exists
Wire up wedding/event forms to the same inquiry endpoint with event_type
Delete or gate dummy-data.ts — verify all pages use lib/data.ts with Payload Local API
Fill in missing .env.local values — Redis, Razorpay, CRON_SECRET
High Priority
Build iCal sync (your selected prompt covers this exactly)
Tokenize the gold accent — add accent-gold: #ba7517 to Tailwind config + CSS vars, then replace hardcoded instances
Consolidate green variants — map #356609 → a semantic token like primary-deep
Add booking cancellation API
Medium Priority
Extract all 84+ hardcoded colors into Tailwind tokens — prerequisite for any future theming or dark mode
Make GST rate configurable in PaymentConfig global
Add Google Maps embed to contact page (once API key is ready)
Hardest to Maintain
lib/payments/ — 5 gateways with different auth patterns; any payment flow changes need testing across all
The color hardcoding scattered across every component makes theme changes extremely manual
dummy-data.ts at 34.6KB — unclear which pages still depend on it vs. live data
