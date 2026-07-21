import { getDb } from '@/db/client'
import { bookings, rooms, blockedDates } from '@/db/schema'
import {
  eq,
  and,
  desc,
  gte,
  lte,
  lt,
  gt,
  or,
  ilike,
  inArray,
  sql,
} from 'drizzle-orm'
import type { NewBooking } from '@/db/schema/bookings'

export type BookingListFilters = {
  status?: string
  payment_status?: string
  source?: string
  room_id?: number
  start_date?: string
  end_date?: string
  search?: string
}

export type BookingRow = {
  id: number
  room_id: number
  room_name: string
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number | null
  payment_method: string
  payment_status: string
  status: string
  source: string
  created_at: Date
}

export async function listBookings(
  filters: BookingListFilters = {},
): Promise<BookingRow[]> {
  const db = getDb()
  const conditions = []

  if (filters.status)
    conditions.push(
      eq(
        bookings.status,
        filters.status as 'confirmed' | 'pending' | 'cancelled',
      ),
    )
  if (filters.payment_status)
    conditions.push(
      eq(
        bookings.payment_status,
        filters.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
      ),
    )
  if (filters.source)
    conditions.push(
      eq(
        bookings.source,
        filters.source as
          | 'website'
          | 'booking_com'
          | 'mmt'
          | 'airbnb'
          | 'agoda'
          | 'goibibo'
          | 'manual',
      ),
    )
  if (filters.room_id) conditions.push(eq(bookings.room_id, filters.room_id))
  if (filters.start_date)
    conditions.push(gte(bookings.check_in, filters.start_date))
  if (filters.end_date)
    conditions.push(lte(bookings.check_in, filters.end_date))
  if (filters.search) {
    const q = `%${filters.search}%`
    const searchCondition = or(
      ilike(bookings.guest_name, q),
      ilike(bookings.guest_email, q),
      ilike(bookings.guest_phone, q),
    )
    if (searchCondition) conditions.push(searchCondition)
  }

  const rows = await db
    .select({
      id: bookings.id,
      room_id: bookings.room_id,
      room_name: rooms.name,
      guest_name: bookings.guest_name,
      guest_phone: bookings.guest_phone,
      guest_email: bookings.guest_email,
      check_in: bookings.check_in,
      check_out: bookings.check_out,
      guests_count: bookings.guests_count,
      total_amount: bookings.total_amount,
      payment_method: bookings.payment_method,
      payment_status: bookings.payment_status,
      status: bookings.status,
      source: bookings.source,
      created_at: bookings.created_at,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.created_at))
    .limit(500)

  return rows.map((r) => ({
    ...r,
    room_name: r.room_name || 'Unknown',
  }))
}

export async function getBookingDetail(id: number) {
  const db = getDb()
  const [row] = await db
    .select({
      booking: bookings,
      room_name: rooms.name,
      room_type: rooms.type,
      room_capacity: rooms.capacity,
      room_price: rooms.price_per_night,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(eq(bookings.id, id))
    .limit(1)

  if (!row) return null
  return {
    ...row.booking,
    room_name: row.room_name || 'Unknown',
    room_type: row.room_type || 'standard',
    room_capacity: row.room_capacity || 2,
    room_price: row.room_price || 0,
  }
}

export async function createBookingAdmin(data: NewBooking) {
  const db = getDb()
  const [created] = await db.insert(bookings).values(data).returning()
  return created
}

export async function updateBooking(id: number, data: Partial<NewBooking>) {
  const db = getDb()
  const [updated] = await db
    .update(bookings)
    .set({ ...data, updated_at: new Date() })
    .where(eq(bookings.id, id))
    .returning()
  return updated || null
}

/** Check if a date range overlaps any existing booking or blocked date for a room. */
export async function checkRoomAvailability(
  roomId: number,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: number,
): Promise<{ available: boolean; reason?: string }> {
  const db = getDb()

  const overlapConditions = [
    eq(bookings.room_id, roomId),
    inArray(bookings.status, ['confirmed', 'pending']),
    lt(bookings.check_in, checkOut),
    gt(bookings.check_out, checkIn),
  ]
  if (excludeBookingId) {
    overlapConditions.push(sql`${bookings.id} != ${excludeBookingId}`)
  }

  const overlapping = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(...overlapConditions))
    .limit(1)

  if (overlapping.length > 0)
    return {
      available: false,
      reason: 'Room is already booked for these dates',
    }

  const blocked = await db
    .select({ id: blockedDates.id })
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.room_id, roomId),
        gte(blockedDates.date, checkIn),
        lt(blockedDates.date, checkOut),
      ),
    )
    .limit(1)

  if (blocked.length > 0)
    return { available: false, reason: 'Some dates are blocked' }

  return { available: true }
}
