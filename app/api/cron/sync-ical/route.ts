import { NextRequest } from 'next/server'
import { getDb } from '@/db/client'
import { rooms, blockedDates, siteContent } from '@/db/schema'
import { and, eq, inArray, notInArray, isNotNull } from 'drizzle-orm'
import { getRedis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

interface SyncResult {
  source: string
  synced: number
  removed: number
}

type IcalContent = {
  bookingcom_ical_url?: string
  mmt_ical_url?: string
}

async function syncFeed(
  feedUrl: string,
  source: string,
  roomId: number,
): Promise<SyncResult> {
  const ical = await import('node-ical')
  const events = await ical.async.fromURL(feedUrl)
  const db = getDb()

  const activeUidPrefixes: string[] = []
  const activeIcalUids: string[] = []
  let synced = 0

  for (const [, component] of Object.entries(events)) {
    if (!component || component.type !== 'VEVENT') continue

    const event = component as import('node-ical').VEvent
    const uid = event.uid
    const dtstart = event.start
    const dtend = event.end

    if (!uid || !dtstart || !dtend) continue

    activeUidPrefixes.push(uid)

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
        .where(and(
          eq(blockedDates.ical_uid, icalUid),
          eq(blockedDates.room_id, roomId),
        ))
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

  // Remove stale ical entries
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

  const removed = staleResult.length

  console.log(`[sync-ical] ${source}: synced=${synced}, removed=${removed}`)
  return { source, synced, removed }
}

async function handler(_request: NextRequest) {
  try {
    const db = getDb()

    const [contentRow] = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.page, 'ical'))
      .limit(1)

    const icalConfig = (contentRow?.content as IcalContent) || {}
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

    const activeRooms = await db
      .select()
      .from(rooms)
      .where(eq(rooms.is_active, true))
      .limit(100)

    if (activeRooms.length === 0) {
      return Response.json({
        success: true,
        message: 'No active rooms found',
        bookingcom_synced: 0,
        mmt_synced: 0,
        timestamp: new Date().toISOString(),
      })
    }

    const defaultRoomId = activeRooms[0].id

    let bookingcomSynced = 0
    let mmtSynced = 0

    if (bookingcomUrl) {
      const result = await syncFeed(bookingcomUrl, 'booking.com', defaultRoomId)
      bookingcomSynced = result.synced
    }

    if (mmtUrl) {
      const result = await syncFeed(mmtUrl, 'makemytrip', defaultRoomId)
      mmtSynced = result.synced
    }

    const timestamp = new Date().toISOString()
    const redis = getRedis()
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

export async function POST(request: NextRequest) {
  const { verifySignatureAppRouter } = await import('@upstash/qstash/nextjs')
  const verified = verifySignatureAppRouter(handler)
  return verified(request)
}
