import { getDb } from '@/db/client'
import { gallery } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { NewGalleryItem, GalleryItem } from '@/db/schema/gallery'

export async function listGalleryAdmin(category?: string): Promise<GalleryItem[]> {
  const db = getDb()
  if (category && category !== 'all') {
    return db
      .select()
      .from(gallery)
      .where(eq(gallery.category, category as 'rooms' | 'wedding' | 'events' | 'pool' | 'restaurant'))
      .orderBy(asc(gallery.sort_order))
  }
  return db.select().from(gallery).orderBy(asc(gallery.sort_order))
}

export async function createGalleryItem(data: NewGalleryItem): Promise<GalleryItem> {
  const db = getDb()
  const [created] = await db.insert(gallery).values(data).returning()
  return created
}

export async function updateGalleryItem(id: number, data: Partial<NewGalleryItem>): Promise<GalleryItem | null> {
  const db = getDb()
  const [updated] = await db.update(gallery).set(data).where(eq(gallery.id, id)).returning()
  return updated || null
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  const db = getDb()
  const result = await db.delete(gallery).where(eq(gallery.id, id)).returning({ id: gallery.id })
  return result.length > 0
}

export async function reorderGalleryItems(updates: { id: number; sort_order: number }[]): Promise<void> {
  const db = getDb()
  for (const u of updates) {
    await db.update(gallery).set({ sort_order: u.sort_order }).where(eq(gallery.id, u.id))
  }
}
