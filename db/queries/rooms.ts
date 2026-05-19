import { getDb } from '@/db/client'
import { rooms } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { Room } from '@/db/schema/rooms'

export async function getActiveRooms(): Promise<Room[]> {
  const db = getDb()
  return db.select().from(rooms).where(eq(rooms.is_active, true)).orderBy(asc(rooms.price_per_night))
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const db = getDb()
  const [room] = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1)
  return room || null
}

export async function getFeaturedRooms(limit = 3): Promise<Room[]> {
  const db = getDb()
  return db
    .select()
    .from(rooms)
    .where(eq(rooms.is_active, true))
    .orderBy(asc(rooms.price_per_night))
    .limit(limit)
}
