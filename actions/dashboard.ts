'use server'

import { getDb } from '@/db/client.ts'
import { bookings } from '@/db/schema/bookings.ts'
import { rooms } from '@/db/schema/rooms.ts'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth.ts'

export async function getCustomerBookings() {
  const session = await getSession('customer')
  if (!session) throw new Error('Unauthorized')
  
  const db = getDb()
  return db
    .select({
      booking: bookings,
      room: {
        name: rooms.name,
        images: rooms.images,
      },
    })
    .from(bookings)
    .leftJoin(rooms, eq(bookings.room_id, rooms.id))
    .where(eq(bookings.user_id, session.id))
    .orderBy(desc(bookings.check_in))
}

export async function getCustomerProfile() {
  const session = await getSession('customer')
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function getCustomerNotifications() {
  // ponytail: YAGNI - no notifications table yet. Return empty until requested.
  return []
}
