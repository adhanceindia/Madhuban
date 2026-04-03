import { NextRequest } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

interface SyncResult {
  source: string
  synced: number
  removed: number
}

/**
 * Fetch and parse an iCal feed, then upsert blocked dates for the given room.
 * Returns the count of events synced and stale entries removed.
 */
async function syncFeed(
  payload: Awaited<ReturnType<typeof getPayload>>,
  feedUrl: string,
  source: string,
  roomId: string,
): Promise<SyncResult> {
  // Dynamic import to avoid BigInt issue during Next.js static build analysis
  const ical = await import('node-ical')

  // Fetch and parse the iCal feed
  const events = await ical.async.fromURL(feedUrl)

  const activeUids: string[] = []
  let synced = 0

  for (const [, component] of Object.entries(events)) {
    if (!component || component.type !== 'VEVENT') continue

    const event = component as import('node-ical').VEvent
    const uid = event.uid
    const dtstart = event.start
    const dtend = event.end

    if (!uid || !dtstart || !dtend) continue

    activeUids.push(uid)

    // Generate one blocked-date entry per day in the range
    const start = new Date(dtstart)
    const end = new Date(dtend)
    const current = new Date(start)

    while (current < end) {
      const dateStr = current.toISOString().split('T')[0]
      const icalUid = `${uid}__${dateStr}`

      // Check if this blocked date already exists
      const existing = await payload.find({
        collection: 'blocked-dates',
        where: {
          ical_uid: { equals: icalUid },
          room: { equals: roomId },
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'blocked-dates',
          data: {
            room: roomId,
            date: `${dateStr}T00:00:00.000Z`,
            source: 'ical',
            ical_uid: icalUid,
          },
        })
        synced++
      }

      current.setDate(current.getDate() + 1)
    }
  }

  // Remove stale entries: blocked dates from iCal that are no longer in the feed
  // Build prefix set from active UIDs for comparison
  const activeUidPrefixes = new Set(activeUids)

  const staleEntries = await payload.find({
    collection: 'blocked-dates',
    where: {
      room: { equals: roomId },
      source: { equals: 'ical' },
    },
    limit: 5000,
  })

  let removed = 0
  for (const entry of staleEntries.docs) {
    if (!entry.ical_uid) continue
    // Extract the base UID (before __date suffix)
    const baseUid = entry.ical_uid.split('__')[0]
    if (!activeUidPrefixes.has(baseUid)) {
      await payload.delete({
        collection: 'blocked-dates',
        id: entry.id,
      })
      removed++
    }
  }

  console.log(`[sync-ical] ${source}: synced=${synced}, removed=${removed}`)
  return { source, synced, removed }
}

async function handler(_request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Fetch Content global to get iCal URLs
    const content = await payload.findGlobal({ slug: 'content' })
    const icalConfig = content.ical as
      | { bookingcom_ical_url?: string; mmt_ical_url?: string }
      | undefined

    const bookingcomUrl = icalConfig?.bookingcom_ical_url
    const mmtUrl = icalConfig?.mmt_ical_url

    if (!bookingcomUrl && !mmtUrl) {
      return Response.json({
        success: true,
        message: 'No iCal URLs configured — nothing to sync',
        bookingcom_synced: 0,
        mmt_synced: 0,
        timestamp: new Date().toISOString(),
      })
    }

    // Get all active rooms — OTA feeds typically block all rooms
    // unless per-room URLs are configured in the future
    const rooms = await payload.find({
      collection: 'rooms',
      where: { is_active: { equals: true } },
      limit: 100,
      depth: 0,
    })

    if (rooms.docs.length === 0) {
      return Response.json({
        success: true,
        message: 'No active rooms found',
        bookingcom_synced: 0,
        mmt_synced: 0,
        timestamp: new Date().toISOString(),
      })
    }

    // For now, sync each OTA feed against the first room
    // TODO: When per-room iCal URLs are supported, map feeds to specific rooms
    const defaultRoomId = String(rooms.docs[0].id)

    let bookingcomSynced = 0
    let mmtSynced = 0

    if (bookingcomUrl) {
      const result = await syncFeed(payload, bookingcomUrl, 'booking.com', defaultRoomId)
      bookingcomSynced = result.synced
    }

    if (mmtUrl) {
      const result = await syncFeed(payload, mmtUrl, 'makemytrip', defaultRoomId)
      mmtSynced = result.synced
    }

    // Update Redis with sync metadata
    const timestamp = new Date().toISOString()
    if (redis) {
      await Promise.all([
        redis.set('ical:last_sync', timestamp),
        redis.set('ical:bookingcom_count', bookingcomSynced),
        redis.set('ical:mmt_count', mmtSynced),
      ])
    }

    return Response.json({
      success: true,
      bookingcom_synced: bookingcomSynced,
      mmt_synced: mmtSynced,
      timestamp,
    })
  } catch (error) {
    console.error('[sync-ical] Error during iCal sync:', error)
    return Response.json(
      { error: 'iCal sync failed', code: 'ICAL_SYNC_ERROR' },
      { status: 500 },
    )
  }
}

export const POST = verifySignatureAppRouter(handler)
