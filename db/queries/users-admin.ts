import { getDb } from '@/db/client'
import { users } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { User } from '@/db/schema/users'

export async function listStaffUsers(): Promise<User[]> {
  const db = getDb()
  return db.select().from(users).orderBy(desc(users.is_active), desc(users.created_at))
}

export async function getStaffUserById(id: number): Promise<User | null> {
  const db = getDb()
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user || null
}
