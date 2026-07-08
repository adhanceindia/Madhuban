'use server'

import { getDb } from '@/db/client.ts'
import { bookings } from '@/db/schema/bookings.ts'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth.ts'

export async function getCustomerBookings() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  
  const db = getDb()
  // ponytail: simplest fetching, join if you need room details later
  return db.select().from(bookings).where(eq(bookings.user_id, session.id))
}

export async function getCustomerProfile() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function getCustomerNotifications() {
  // ponytail: YAGNI - no notifications table yet. Return empty until requested.
  return []
}
