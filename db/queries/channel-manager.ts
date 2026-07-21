import { getDb } from '@/db/client'
import { blockedDates, bookings, icalSyncLogs } from '@/db/schema'
import { eq, count, and, gte, sql, inArray, desc } from 'drizzle-orm'
import { todayISO } from '@/lib/format'
import type { IcalSyncLog } from '@/db/schema/ical-sync-log'

/** All booking sources that originate from an OTA (imported or direct). */
export const OTA_BOOKING_SOURCES = [
  'booking_com',
  'mmt',
  'airbnb',
  'agoda',
  'goibibo',
] as const

/** Counts of blocked dates per source. */
export async function getBlockedCountsBySource() {
  const db = getDb()
  const rows = await db
    .select({
      source: blockedDates.source,
      count: count(),
    })
    .from(blockedDates)
    .where(gte(blockedDates.date, todayISO()))
    .groupBy(blockedDates.source)

  const result: Record<string, number> = { manual: 0, ical: 0 }
  for (const r of rows) {
    result[r.source] = r.count
  }
  return result
}

/** Bookings whose source is from an OTA (any of the 5 supported channels). */
export async function getOtaBookingCount() {
  const db = getDb()
  const [{ value }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(
      and(
        inArray(bookings.source, [...OTA_BOOKING_SOURCES]),
        gte(bookings.check_in, todayISO()),
      ),
    )
  return value
}

/** Detect overlapping bookings: OTA imports vs direct bookings on same room+date. */
export async function getConflicts() {
  const db = getDb()
  // For each iCal-blocked date, check if there's also a confirmed/pending
  // DIRECT booking (non-OTA) on the same room. OTA bookings imported as
  // blocked_dates are excluded from the join's right side so we don't flag
  // two OTA imports as a conflict.
  const otaList = OTA_BOOKING_SOURCES.map((s) => `'${s}'`).join(', ')
  const result = await db.execute<{
    room_id: number
    date: string
    booking_id: number
    guest_name: string
  }>(sql`
    SELECT bd.room_id, bd.date, b.id as booking_id, b.guest_name
    FROM blocked_dates bd
    INNER JOIN bookings b
      ON bd.room_id = b.room_id
      AND b.check_in <= bd.date
      AND b.check_out > bd.date
      AND b.status IN ('confirmed', 'pending')
      AND b.source NOT IN (${sql.raw(otaList)})
    WHERE bd.source = 'ical'
      AND bd.date >= ${todayISO()}
    LIMIT 50
  `)
  return result as unknown as {
    room_id: number
    date: string
    booking_id: number
    guest_name: string
  }[]
}

/** Recent iCal sync history for the Channel Manager dashboard. */
export async function getRecentSyncLogs(limit = 20): Promise<IcalSyncLog[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(icalSyncLogs)
    .orderBy(desc(icalSyncLogs.started_at))
    .limit(limit)
  return rows
}
