# Channel Manager overhaul — Airbnb, Agoda, Goibibo wiring, per-room mapping, sync logs, manual-sync, cache invalidation, export fix

## Decisions locked
- **Room mapping**: per-listing → room (each OTA supports multiple iCal URLs, each mapped to a specific room or "all rooms")
- **Sync logs**: DB table `ical_sync_logs` (persistent) + Redis `ical:last_summary` (last-run summary for the dashboard)
- **Channels**: Booking.com + MMT + Airbnb + Agoda + Goibibo (5 channels, all synced)
- **`source` enum on `bookings`**: extend with `'airbnb'`, `'agoda'` (Goibibo has no bookings-side value since it only blocks via iCal today, but I'll add `'goibibo'` too for future-proofing and consistency)

---

## Part A — Schema + migration

### A1. New schema file `db/schema/ical-sync-log.ts`
```
icalSyncLogs = pgTable('ical_sync_logs', {
  id, source text, feed_url text,
  room_id integer FK→rooms.id NULLABLE (null = "all rooms"),
  started_at timestamptz, finished_at timestamptz,
  status text enum ['success','error','partial'],
  synced_count int default 0, removed_count int default 0,
  error text,           // null on success
  triggered_by text enum ['cron','manual'],  // who kicked it off
  triggered_by_user_id integer FK→users.id NULLABLE,
})
```
Exported from `db/schema/index.ts`. Types `IcalSyncLog`, `NewIcalSyncLog`.

### A2. Extend `db/schema/bookings.ts:19`
`source` enum: `['website', 'booking_com', 'mmt', 'airbnb', 'agoda', 'goibibo', 'manual']`

### A3. New migration `db/migrations/0003_channel_manager.sql` (hand-authored, NOT drizzle-generated)
- `CREATE TABLE ical_sync_logs (...)` — matches A1
- Inline-text enums don't need `ALTER TYPE` (Postgres has no constraint on these — confirmed by explorer), so the `bookings.source` change is **TS-only**; existing rows are unaffected. I'll note this in the migration header as a comment.
- Add the standard `9999_enable_rls.sql`-style grants for `ical_sync_logs` (REVOKE from anon/authenticated) to keep RLS consistent.
- Register in `db/migrations/meta/_journal.json` with idx 3.
- Apply via a one-shot `apply-0003.mjs` runner adapted from the existing `apply-migration.mjs` pattern.

---

## Part B — Config storage refactor (per-listing → room)

### B1. `lib/cms-schema.ts` (~line 335)
Replace the flat 3-field `ical` schema with a **repeater-driven** schema: drop `bookingcom_ical_url` / `mmt_ical_url` / `goibibo_ical_url` / and never-add the `airbnb_*` / `agoda_*` flat fields. Instead, the iCal config is no longer edited in the generic CMS editor — it's edited only in the Channel Manager UI. So set the schema's `fields: []` with a description pointing to Channel Manager (keeps `getPageSchema('ical')` returning a valid entry for the content PUT route, but the generic editor shows nothing).

### B2. New canonical type `lib/ical/types.ts`
```ts
export type IcalSource = 'booking_com' | 'mmt' | 'airbnb' | 'agoda' | 'goibibo'
export type IcalFeedConfig = {
  id: string              // stable uuid for repeater keys
  source: IcalSource
  url: string
  roomId: number | null   // null = "all rooms"
}
export type IcalConfig = { feeds: IcalFeedConfig[] }
```

### B3. New helpers `lib/ical/config.ts`
- `getIcalConfig(): Promise<IcalConfig>` — reads `siteContent.page='ical'`, migrates any legacy flat `{bookingcom_ical_url, mmt_ical_url, goibibo_ical_url}` shape to the new `feeds[]` shape (one-time back-compat), returns normalized config.
- `saveIcalConfig(config: IcalConfig)` — validates via zod (`lib/ical/schema.ts`), calls `upsertPageContent('ical', config)`.
- `zodIcalConfigSchema` for validation.

This is the **single source of truth** — the cron, the admin GET, the manual-sync route, and the UI all read through `getIcalConfig()`.

---

## Part C — Sync engine refactor (the heart of the change)

### C1. New module `lib/ical/sync.ts`
Extract and generalize the existing `syncFeed()` from `app/api/cron/sync-ical/route.ts`. New signature:
```ts
export async function runIcalSync(opts: {
  triggeredBy: 'cron' | 'manual'
  triggeredByUserId?: number
}): Promise<IcalRunSummary>
```
Where `IcalRunSummary`:
```ts
type IcalRunSummary = {
  startedAt: string; finishedAt: string; status: 'success' | 'partial' | 'error'
  perFeed: Array<{ source: IcalSource; feedUrl: string; roomId: number | null; synced: number; removed: number; error?: string }>
  roomsTouched: number[]   // distinct room IDs that got new/removed rows (for cache invalidation)
  totalSynced: number; totalRemoved: number
}
```

Logic:
1. `const config = await getIcalConfig()`
2. Fetch all active rooms once (for the "all rooms" expansion — `roomId === null` means fan out to every active room).
3. For each `feed` in `config.feeds`:
   - Resolve target room IDs: `feed.roomId === null ? allActiveRoomIds : [feed.roomId]`
   - For each target room: call `syncFeed(feedUrl, feed.source, roomId)` (existing per-room logic, kept verbatim but moved here; uses `node-ical` dynamic import, same `ical_uid = ${uid}__${date}` format, same stale-cleanup `notInArray`).
   - On per-feed error: capture `error`, mark feed status `'error'`, continue (don't abort the whole run).
   - Record `perFeed[]` entries; collect touched rooms.
4. Compute overall `status`: `'error'` if all feeds failed, `'partial'` if some failed, `'success'` if all OK.
5. **Cache invalidation** (gap #5 fix): for each distinct `roomId` in `roomsTouched`, call `await invalidateRoomAvailability(roomId)` (see Part D).
6. **Logging** (gap #2 fix): insert one `ical_sync_logs` row per feed (source, feed_url, room_id, started_at, finished_at, status, synced_count, removed_count, error, triggered_by, triggered_by_user_id).
7. **Redis summary** (for dashboard quick-read): `redis.set('ical:last_sync', finishedAt)` + `redis.set('ical:last_summary', JSON.stringify(summary))` + per-source counters `ical:count:{source}` = sum of synced.
8. Return the summary.

### C2. Slim down `app/api/cron/sync-ical/route.ts`
The `handler()` becomes 3 lines: `const summary = await runIcalSync({ triggeredBy: 'cron' }); return Response.json(summary)`. Keeps the `verifySignatureAppRouter(handler)` QStash wrapper unchanged.

---

## Part D — Cache invalidation (gap #5, done properly)

### D1. New helper `lib/ical/cache.ts`
```ts
export async function invalidateRoomAvailability(roomId: number): Promise<void>
export async function invalidateAllAvailability(): Promise<void>
```
Strategy: **SCAN, not KEYS** (O(N) `KEYS` blocks the event loop on big keyspaces). Implementation:
```ts
const redis = getRedis()
if (!redis) return
let cursor = '0'
do {
  const [next, keys] = await redis.scan(cursor, { match: `avail:${roomId}:*`, count: 200 })
  cursor = next
  if (keys.length) await redis.del(...keys)
} while (cursor !== '0')
```
`invalidateAllAvailability()` does the same with `match: 'avail:*'`.

### D2. Wire invalidation into existing write paths
Call `invalidateRoomAvailability(roomId)` after every mutation that affects availability:
- ✅ `lib/ical/sync.ts` — already in C1 step 5.
- **`db/queries/calendar.ts`** `createManualBlock()` and `removeManualBlock()` — append the invalidation call after the DB write. Both currently skip this (confirmed gap). Return the roomId from `removeManualBlock` so the caller can invalidate, or invalidate inside (cleaner — invalidate inside, swallow errors).
- **`lib/payments/common.ts:56-57`** + **`app/api/payments/order/route.ts:155`** + **`app/api/bookings/route.ts:157-158`** — replace the single-key `redis.del(cacheKey)` with `invalidateRoomAvailability(booking.room_id)`. This fixes the *overlapping-query* bug the explorer flagged (today a booking from 8/10–8/12 doesn't invalidate a cached query for 8/09–8/13 even though it should).

---

## Part E — Export route fix (gap #7)

### E1. `app/api/ical/export/route.ts`
Change the `conditions` from `[eq(bookings.status, 'confirmed')]` to include `pending`:
```ts
const conditions = [inArray(bookings.status, ['confirmed', 'pending'])]
```
Rationale: `getConflicts()` treats pending as occupancy, so the export should too — otherwise a pending direct booking doesn't reach the OTAs and creates a double-booking window. This aligns the export with the conflict definition.

(Omitting OTA-imported blocks from the export is correct: those blocks *came from* the OTAs, re-exporting them would create an infinite loop. So no union with `blocked_dates`.)

---

## Part F — New endpoints

### F1. `app/api/admin/channel-manager/sync/route.ts` (manual sync — gap #1)
```ts
export const POST = apiHandler({
  module: 'channel-manager',
  audit: { action: 'channel_manager.sync_triggered', entityType: 'channel_manager' },
  handler: async () => {
    const summary = await runIcalSync({ triggeredBy: 'manual', triggeredByUserId: session.id })
    return summary
  },
})
```
Reuses the same engine as the cron, just gated by admin session + RBAC instead of QStash signature.

### F2. Extend `app/api/admin/channel-manager/route.ts` (GET)
- Replace flat `bookingcom_count`/`mmt_count` with `counts: Record<IcalSource, number>` (built from `ical:count:{source}` Redis keys).
- Add `feeds: IcalFeedConfig[]` (from `getIcalConfig()`) so the UI can render the repeater.
- Add `recent_logs: IcalSyncLog[]` (last 20 from `ical_sync_logs`) — gap #2 UI data.
- Keep `last_sync`, `conflicts`, `blocked_counts`, `ota_booking_count` (update `getOtaBookingCount` — see F4).

### F3. `db/queries/channel-manager.ts` updates
- `getOtaBookingCount()`: `inArray(bookings.source, ['booking_com', 'mmt', 'airbnb', 'agoda', 'goibibo'])`
- `getConflicts()` raw SQL: `b.source NOT IN ('booking_com', 'mmt', 'airbnb', 'agoda', 'goibibo')`
- New `getRecentSyncLogs(limit = 20)` — selects from `ical_sync_logs` ordered by `started_at desc`.

### F4. Update OTA-source consumers (9 files — from explorer section 6A)
For each of these, extend the source list/enum to include all 5 OTAs:
- `lib/schemas/bookings.ts:14` — zod enum
- `components/admin/bookings/BookingForm.tsx:32, 232-233` — type + `<option>`s
- `components/admin/bookings/BookingsList.tsx:48-49` — filter options
- `db/queries/bookings-admin.ts:41` — filter cast
- `db/queries/dashboard.ts:101, 109-110` — sourceCounts + chart series
- `components/admin/shared/status-badge.tsx:19` — color mappings for the 3 new sources

---

## Part G — Channel Manager UI rewrite

### G1. `components/admin/channel-manager/ChannelManagerView.tsx` (full rewrite of the body)
**New layout:**
1. **Header row**: PageHeader + **"Sync now" button** (top-right, in the `actions` slot of PageHeader). Uses a `syncing` state; on click POSTs to `/api/admin/channel-manager/sync`, shows toast, refetches. Replicates the `saveUrls()` pattern.
2. **Channel status cards** (5 cards: Booking.com, MMT, Airbnb, Agoda, Goibibo): each card reads its count from `data.counts[source]` and shows CONNECTED if any feed with that source exists in `data.feeds`. Grid switches to `md:grid-cols-5` (or `lg:grid-cols-5` with `md:grid-cols-3`).
3. **Conflicts panel** — unchanged logic.
4. **"iCal feeds" repeater FormCard**: dynamic list of feeds. Each row has:
   - Source `<select>` (5 OTAs)
   - URL `<input type="url">`
   - Room `<select>` (all active rooms + "All rooms" option)
   - Remove-row trash button
   - "+ Add feed" button
   - Save button persists the whole array via PUT to `/api/admin/content/ical` (the existing generic route — no new PUT endpoint needed since `saveIcalConfig` will be the validation layer... actually, to enforce the zod schema I'll add `app/api/admin/channel-manager/feeds/route.ts` PUT that calls `saveIcalConfig`. Cleaner than piggybacking on the generic content route.)
5. **Sync logs panel** (new, gap #2 UI): a FormCard listing the last 20 runs from `data.recent_logs` — columns: timestamp, source, room, status badge, synced/removed counts, error (if any), triggered-by icon (clock for cron, user for manual).
6. **Export URL box** — unchanged, but append `?token=…` note in the description since the token is required.

### G2. New `app/api/admin/channel-manager/feeds/route.ts` (PUT)
```ts
export const PUT = apiHandler({
  module: 'channel-manager',
  schema: zodIcalConfigSchema,
  audit: { action: 'channel_manager.feeds_updated', entityType: 'channel_manager' },
  handler: async (body) => { await saveIcalConfig(body); return { ok: true } },
})
```

### G3. New shared component `components/admin/channel-manager/SyncLogs.tsx`
Renders the logs table (reusable, keeps the view file under control).

---

## Part H — Docs

### H1. Update `QSTASH_SETUP.md`
Add a row noting manual-sync is also available via the admin UI button (no QStash involvement). No new cron routes.

### H2. Update `.env.example`
No new env vars needed — all the infra (Redis, QStash, ICAL_EXPORT_TOKEN) is already there. Add a comment under `ICAL_EXPORT_TOKEN` clarifying OTAs need `?token=…` appended.

### H3. Update `AGENTS.md` — **deferred**
The `AGENTS.md` is the workspace instruction file. I'll flag the stack drift (Drizzle not Prisma; 5 OTAs not 2) but **will not edit it** in this pass unless you ask — it's a client-controlled doc and the changes are factual corrections the client may want to review. (Will mention in the final summary.)

---

## Files touched — full inventory

**New files (12):**
- `db/schema/ical-sync-log.ts`
- `db/migrations/0003_channel_manager.sql`
- `db/migrations/meta/_journal.json` (edit — add idx 3)
- `apply-0003.mjs`
- `lib/ical/types.ts`
- `lib/ical/config.ts`
- `lib/ical/schema.ts`
- `lib/ical/sync.ts`
- `lib/ical/cache.ts`
- `app/api/admin/channel-manager/sync/route.ts`
- `app/api/admin/channel-manager/feeds/route.ts`
- `components/admin/channel-manager/SyncLogs.tsx`

**Edited files (16):**
- `db/schema/bookings.ts` (source enum)
- `db/schema/index.ts` (export new schema)
- `app/api/cron/sync-ical/route.ts` (delegate to `runIcalSync`)
- `app/api/ical/export/route.ts` (add `pending`)
- `app/api/admin/channel-manager/route.ts` (new response shape)
- `db/queries/channel-manager.ts` (extend OTA lists + `getRecentSyncLogs`)
- `db/queries/calendar.ts` (invalidate cache in create/remove block)
- `lib/payments/common.ts` (use `invalidateRoomAvailability`)
- `app/api/payments/order/route.ts` (same)
- `app/api/bookings/route.ts` (same)
- `lib/schemas/bookings.ts` (zod enum)
- `components/admin/bookings/BookingForm.tsx` (options + type)
- `components/admin/bookings/BookingsList.tsx` (filter options)
- `db/queries/bookings-admin.ts` (filter cast)
- `db/queries/dashboard.ts` (sourceCounts + series)
- `components/admin/shared/status-badge.tsx` (color mappings)
- `lib/cms-schema.ts` (ical schema simplification)
- `components/admin/channel-manager/ChannelManagerView.tsx` (full body rewrite)
- `QSTASH_SETUP.md`, `.env.example` (docs)

---

## Gaps closed — mapping to your original 6
1. ✅ Manual-sync button → F1 + G1.2
2. ✅ Sync logs → A1 + C1 step 6 + F3 + G3
3. ✅ Goibibo wired → C1 (feeds loop covers all 5 sources)
4. ✅ Per-room mapping → B2/B3 + C1 (per-feed `roomId` / "all rooms")
5. ✅ Availability cache invalidated on sync → D1/D2
6. ✅ Export includes pending → E1
(+ Airbnb + Agoda added throughout)

---

## Verification
- `npm run lint` — must pass (existing Next lint config)
- `npm run build` — must typecheck cleanly (this is the project's typecheck; no separate `tsc`)
- Manual smoke: I can't run the full app (needs DB + Supabase + Upstash env), but I'll confirm the build succeeds and the new routes are registered. I'll also leave the SQL migration un-run (you'll apply it via the Supabase SQL editor or the `apply-0003.mjs` script I'll provide) — running migrations against your DB without explicit go-ahead is out of scope.

---

## Open risk to flag
- **Goibibo iCal availability**: Goibibo's extranet exposes iCal sync for property managers but it's been spotty historically. The wiring will be correct (same pattern as Booking.com/MMT); whether Goibibo's specific feed format parses cleanly with `node-ical` is something only a live test against a real Goibibo URL can confirm. I'll note this in the channel card UI ("If sync fails, the feed URL may need re-fetching from Goibibo's extranet").
- **Agoda**: same caveat — Agoda's iCal is well-documented and standard, low risk.
- **Airbnb**: standard, well-tested with `node-ical`. Lowest risk of the three new ones.

Shall I proceed with implementation?