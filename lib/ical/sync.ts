import { getDb } from '@/db/client'
import { blockedDates, icalSyncLogs, rooms } from '@/db/schema'
import { and, eq, isNotNull, notInArray } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'
import { invalidateRoomAvailability } from '@/lib/ical/cache'
import { getIcalConfig } from '@/lib/ical/config'
import type {
  IcalFeedSyncResult,
  IcalRunSummary,
  IcalSource,
} from '@/lib/ical/types'

/**
 * Channel-manager sync engine.
 *
 * Shared by the QStash-scheduled cron and the admin "Sync now" button.
 * Reads the per-listing iCal config, fans each feed out to its target room
 * (or all rooms when `roomId === null`), upserts/deletes `blocked_dates`
 * rows, invalidates the availability cache for every room touched, writes
 * one `ical_sync_logs` row per (feed × room), and publishes a run summary
 * to Redis for the dashboard.
 *
 * One feed failure does NOT abort the run — the engine records the error
 * and continues with the next feed. Overall `status` is `partial` if any
 * feed failed, `error` only if every feed failed.
 */

// ---- per-feed-per-room sync -------------------------------------------------

async function syncFeedForRoom(
  feedUrl: string,
  roomId: number,
): Promise<{ synced: number; removed: number }> {
  const ical = await import('node-ical')
  const events = await ical.async.fromURL(feedUrl)
  const db = getDb()

  const activeIcalUids: string[] = []
  let synced = 0

  for (const [, component] of Object.entries(events)) {
    if (!component || component.type !== 'VEVENT') continue

    const event = component as import('node-ical').VEvent
    const uid = event.uid
    const dtstart = event.start
    const dtend = event.end

    if (!uid || !dtstart || !dtend) continue

    const start = new Date(dtstart)
    const end = new Date(dtend)
    const current = new Date(start)

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0]
      const icalUid = `${uid}__${dateStr}`
      activeIcalUids.push(icalUid)

      const existing = await db
        .select({ id: blockedDates.id })
        .from(blockedDates)
        .where(
          and(
            eq(blockedDates.ical_uid, icalUid),
            eq(blockedDates.room_id, roomId),
          ),
        )
        .limit(1)

      if (existing.length === 0) {
        await db.insert(blockedDates).values({
          room_id: roomId,
          date: dateStr,
          source: 'ical',
          ical_uid: icalUid,
        })
        synced++
      }

      current.setDate(current.getDate() + 1)
    }
  }

  // Remove stale ical entries for this room (no longer present in the feed).
  const staleConditions = [
    eq(blockedDates.room_id, roomId),
    eq(blockedDates.source, 'ical'),
    isNotNull(blockedDates.ical_uid),
  ]
  if (activeIcalUids.length > 0) {
    staleConditions.push(notInArray(blockedDates.ical_uid, activeIcalUids))
  }
  const staleResult = await db
    .delete(blockedDates)
    .where(and(...staleConditions))
    .returning({ id: blockedDates.id })

  return { synced, removed: staleResult.length }
}

// ---- full run ---------------------------------------------------------------

export async function runIcalSync(opts: {
  triggeredBy: 'cron' | 'manual'
  triggeredByUserId?: number
}): Promise<IcalRunSummary> {
  const startedAt = new Date()
  const db = getDb()

  const [config, activeRooms] = await Promise.all([
    getIcalConfig(),
    getActiveRooms(),
  ])

  const perFeed: IcalFeedSyncResult[] = []
  const roomsTouched = new Set<number>()
  let totalSynced = 0
  let totalRemoved = 0
  let failureCount = 0

  for (const feed of config.feeds) {
    if (!feed.url) continue

    // Resolve target rooms: feed.roomId === null → all active rooms.
    const targetRoomIds =
      feed.roomId === null ? activeRooms.map((r) => r.id) : [feed.roomId]

    for (const roomId of targetRoomIds) {
      const feedStartedAt = new Date()
      let result: IcalFeedSyncResult
      try {
        const { synced, removed } = await syncFeedForRoom(feed.url, roomId)
        result = {
          source: feed.source,
          feedUrl: feed.url,
          roomId,
          synced,
          removed,
          status: 'success',
          startedAt: feedStartedAt.toISOString(),
          finishedAt: new Date().toISOString(),
        }
        totalSynced += synced
        totalRemoved += removed
        roomsTouched.add(roomId)
        console.log(
          `[sync-ical] ${feed.source} room=${roomId}: +${synced} -${removed}`,
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        result = {
          source: feed.source,
          feedUrl: feed.url,
          roomId,
          synced: 0,
          removed: 0,
          status: 'error',
          error: message,
          startedAt: feedStartedAt.toISOString(),
          finishedAt: new Date().toISOString(),
        }
        failureCount++
        console.error(
          `[sync-ical] ${feed.source} room=${roomId} FAILED:`,
          message,
        )
      }
      perFeed.push(result)

      // Persist the per-feed-per-room log row.
      try {
        await db.insert(icalSyncLogs).values({
          source: result.source,
          feed_url: result.feedUrl,
          room_id: result.roomId,
          started_at: feedStartedAt,
          finished_at: new Date(result.finishedAt),
          status: result.status === 'success' ? 'success' : 'error',
          synced_count: result.synced,
          removed_count: result.removed,
          error: result.error,
          triggered_by: opts.triggeredBy,
          triggered_by_user_id: opts.triggeredByUserId ?? null,
        })
      } catch (logErr) {
        // Log persistence is non-critical — don't fail the run over it.
        console.error('[sync-ical] failed to persist sync log:', logErr)
      }
    }
  }

  const finishedAt = new Date()
  const overallStatus: IcalRunSummary['status'] =
    perFeed.length === 0
      ? 'success'
      : failureCount === perFeed.length
        ? 'error'
        : failureCount > 0
          ? 'partial'
          : 'success'

  // Invalidate availability cache for every room that received a mutation.
  // (Failure paths also touch no rows, but we still invalidate defensively —
  // a feed that errored mid-loop may have partially written.)
  for (const roomId of roomsTouched) {
    await invalidateRoomAvailability(roomId)
  }

  const summary: IcalRunSummary = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    status: overallStatus,
    perFeed,
    roomsTouched: Array.from(roomsTouched),
    totalSynced,
    totalRemoved,
    triggeredBy: opts.triggeredBy,
  }

  // Publish a quick-read summary to Redis for the dashboard.
  await publishSummaryToRedis(summary)

  return summary
}

// ---- helpers ----------------------------------------------------------------

async function getActiveRooms() {
  const db = getDb()
  return db
    .select({ id: rooms.id })
    .from(rooms)
    .where(eq(rooms.is_active, true))
    .limit(200)
}

async function publishSummaryToRedis(summary: IcalRunSummary): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    // Per-source synced totals (most recent run).
    const perSource: Record<string, number> = {}
    for (const r of summary.perFeed) {
      if (r.status === 'success') {
        perSource[r.source] = (perSource[r.source] || 0) + r.synced
      }
    }
    const pipeline: Promise<unknown>[] = [
      redis.set('ical:last_sync', summary.finishedAt),
      redis.set('ical:last_summary', JSON.stringify(summary)),
    ]
    for (const source of Object.keys(perSource) as IcalSource[]) {
      pipeline.push(redis.set(`ical:count:${source}`, perSource[source] ?? 0))
    }
    await Promise.all(pipeline)
  } catch (err) {
    console.warn('[sync-ical] failed to publish summary to Redis:', err)
  }
}
