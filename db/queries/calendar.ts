import { getDb } from '@/db/client'
import { rooms, bookings, blockedDates } from '@/db/schema'
import { eq, and, gte, lte, inArray, asc } from 'drizzle-orm'
import { invalidateRoomAvailability } from '@/lib/ical/cache'
import type { Room } from '@/db/schema/rooms'
import type { Booking } from '@/db/schema/bookings'
import type { BlockedDate } from '@/db/schema/blocked-dates'

export type CalendarData = {
  rooms: Room[]
  bookings: Booking[]
  blocked: BlockedDate[]
}

export async function getCalendarData(
  start: string,
  end: string,
): Promise<CalendarData> {
  const db = getDb()

  const allRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.is_active, true))
    .orderBy(asc(rooms.name))

  const overlapping = await db
    .select()
    .from(bookings)
    .where(
      and(
        lte(bookings.check_in, end),
        gte(bookings.check_out, start),
        inArray(bookings.status, ['confirmed', 'pending']),
      ),
    )
    .orderBy(asc(bookings.check_in))

  const blocked = await db
    .select()
    .from(blockedDates)
    .where(and(gte(blockedDates.date, start), lte(blockedDates.date, end)))

  return { rooms: allRooms, bookings: overlapping, blocked }
}

export async function createManualBlock(roomId: number, date: string) {
  const db = getDb()
  const [created] = await db
    .insert(blockedDates)
    .values({ room_id: roomId, date, source: 'manual' })
    .returning()
  // Availability cache overlaps this date — wipe all cached queries for the room.
  await invalidateRoomAvailability(roomId)
  return created
}

export async function removeManualBlock(id: number): Promise<boolean> {
  const db = getDb()
  const [existing] = await db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.id, id))
    .limit(1)
  if (!existing) return false
  if (existing.source !== 'manual') {
    throw new Error(
      'Cannot remove non-manual block (iCal blocks sync automatically)',
    )
  }
  const result = await db
    .delete(blockedDates)
    .where(eq(blockedDates.id, id))
    .returning({ id: blockedDates.id })
  if (result.length > 0) {
    await invalidateRoomAvailability(existing.room_id)
  }
  return result.length > 0
}
