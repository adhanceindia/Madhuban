import { getDb } from '@/db/client'
import { reviews } from '@/db/schema'
import { eq, desc, and, ilike } from 'drizzle-orm'
import type { NewReview, Review } from '@/db/schema/reviews'

export type ReviewListFilters = {
  source?: string
  published?: string
  search?: string
}

export async function listReviewsAdmin(filters: ReviewListFilters = {}): Promise<Review[]> {
  const db = getDb()
  const conditions = []

  if (filters.source) conditions.push(eq(reviews.source, filters.source as 'google' | 'manual'))
  if (filters.published === 'yes') conditions.push(eq(reviews.is_published, true))
  if (filters.published === 'no') conditions.push(eq(reviews.is_published, false))
  if (filters.search) {
    conditions.push(ilike(reviews.guest_name, `%${filters.search}%`))
  }

  return db
    .select()
    .from(reviews)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reviews.created_at))
    .limit(500)
}

export async function getReviewById(id: number): Promise<Review | null> {
  const db = getDb()
  const [row] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1)
  return row || null
}

export async function createReview(data: NewReview): Promise<Review> {
  const db = getDb()
  const [created] = await db.insert(reviews).values(data).returning()
  return created
}

export async function updateReview(id: number, data: Partial<NewReview>): Promise<Review | null> {
  const db = getDb()
  const [updated] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning()
  return updated || null
}

export async function deleteReview(id: number): Promise<boolean> {
  const db = getDb()
  const result = await db.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id })
  return result.length > 0
}

export async function getReviewStats() {
  const db = getDb()
  const all = await db.select().from(reviews).where(eq(reviews.is_published, true))
  if (all.length === 0) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] }

  const sum = all.reduce((s, r) => s + r.rating, 0)
  const average = sum / all.length
  const distribution = [0, 0, 0, 0, 0]
  for (const r of all) {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1] += 1
  }
  return { average, count: all.length, distribution }
}
