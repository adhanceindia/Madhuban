import { getDb } from '@/db/client'
import { bookings, rooms } from '@/db/schema'
import { eq, and, inArray, lte, gte, asc } from 'drizzle-orm'

export type FrontDeskBooking = {
  id: number
  guest_name: string
  guest_phone: string
  guest_email: string
  room_id: number
  room_name: string
  check_in: string
  check_out: string
  guests_count: number
  total_amount: number | null
  status: string
  payment_status: string
  source: string
}

/**
 * Bookings checking in on a specific date (status confirmed or pending,
 * not cancelled or already past).
 */
export async function getArrivals(date: string): Promise<FrontDeskBooking[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: bookings.id,
      guest_name: bookings.guest_name,
      guest_phone: bookings.guest_phone,
      guest_email: bookings.guest_email,
      room_id: bookings.room_id,
      room_name: rooms.name,
      check_in: bookings.check_in,
      check_out: bookings.check_out,
      guests_count: bookings.guests_count,
      total_amount: bookings.total_amount,
      status: bookings.status,
      payment_status: bookings.payment_status,
      source: bookings.source,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(and(
      eq(bookings.check_in, date),
      inArray(bookings.status, ['confirmed', 'pending']),
    ))
    .orderBy(asc(bookings.check_in))

  return rows.map((r) => ({ ...r, room_name: r.room_name || 'Unknown' }))
}

/** Bookings checking out on a specific date. */
export async function getDepartures(date: string): Promise<FrontDeskBooking[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: bookings.id,
      guest_name: bookings.guest_name,
      guest_phone: bookings.guest_phone,
      guest_email: bookings.guest_email,
      room_id: bookings.room_id,
      room_name: rooms.name,
      check_in: bookings.check_in,
      check_out: bookings.check_out,
      guests_count: bookings.guests_count,
      total_amount: bookings.total_amount,
      status: bookings.status,
      payment_status: bookings.payment_status,
      source: bookings.source,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(and(
      eq(bookings.check_out, date),
      eq(bookings.status, 'confirmed'),
    ))
    .orderBy(asc(bookings.check_out))

  return rows.map((r) => ({ ...r, room_name: r.room_name || 'Unknown' }))
}

/** Guests currently in-house on a given date (check_in <= date < check_out). */
export async function getInHouse(date: string): Promise<FrontDeskBooking[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: bookings.id,
      guest_name: bookings.guest_name,
      guest_phone: bookings.guest_phone,
      guest_email: bookings.guest_email,
      room_id: bookings.room_id,
      room_name: rooms.name,
      check_in: bookings.check_in,
      check_out: bookings.check_out,
      guests_count: bookings.guests_count,
      total_amount: bookings.total_amount,
      status: bookings.status,
      payment_status: bookings.payment_status,
      source: bookings.source,
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(and(
      eq(bookings.status, 'confirmed'),
      lte(bookings.check_in, date),
      gte(bookings.check_out, date),
    ))
    .orderBy(asc(bookings.check_in))

  return rows.map((r) => ({ ...r, room_name: r.room_name || 'Unknown' }))
}
