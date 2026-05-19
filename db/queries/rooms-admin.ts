import { getDb } from '@/db/client'
import { rooms } from '@/db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import type { NewRoom, Room } from '@/db/schema/rooms'

export async function listAllRooms(): Promise<Room[]> {
  const db = getDb()
  return db.select().from(rooms).orderBy(desc(rooms.is_active), asc(rooms.price_per_night))
}

export async function getRoomById(id: number): Promise<Room | null> {
  const db = getDb()
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1)
  return room || null
}

export async function getRoomBySlugAdmin(slug: string): Promise<Room | null> {
  const db = getDb()
  const [room] = await db.select().from(rooms).where(eq(rooms.slug, slug)).limit(1)
  return room || null
}

export async function createRoom(data: NewRoom): Promise<Room> {
  const db = getDb()
  const [created] = await db.insert(rooms).values(data).returning()
  return created
}

export async function updateRoom(id: number, data: Partial<NewRoom>): Promise<Room | null> {
  const db = getDb()
  const [updated] = await db
    .update(rooms)
    .set({ ...data, updated_at: new Date() })
    .where(eq(rooms.id, id))
    .returning()
  return updated || null
}

export async function deleteRoom(id: number): Promise<boolean> {
  const db = getDb()
  const result = await db.delete(rooms).where(eq(rooms.id, id)).returning({ id: rooms.id })
  return result.length > 0
}
