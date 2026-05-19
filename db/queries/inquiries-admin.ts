import { getDb } from '@/db/client'
import { inquiries } from '@/db/schema'
import { eq, desc, and, or, ilike } from 'drizzle-orm'
import type { NewInquiry, Inquiry } from '@/db/schema/inquiries'

export type InquiryListFilters = {
  status?: string
  event_type?: string
  search?: string
}

export async function listInquiries(filters: InquiryListFilters = {}): Promise<Inquiry[]> {
  const db = getDb()
  const conditions = []

  if (filters.status) conditions.push(eq(inquiries.status, filters.status as 'new' | 'contacted' | 'closed'))
  if (filters.event_type)
    conditions.push(eq(inquiries.event_type, filters.event_type as 'wedding' | 'birthday' | 'corporate' | 'other'))
  if (filters.search) {
    const q = `%${filters.search}%`
    const c = or(ilike(inquiries.name, q), ilike(inquiries.email, q), ilike(inquiries.phone, q))
    if (c) conditions.push(c)
  }

  return db
    .select()
    .from(inquiries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(inquiries.created_at))
    .limit(500)
}

export async function getInquiryById(id: number): Promise<Inquiry | null> {
  const db = getDb()
  const [row] = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1)
  return row || null
}

export async function updateInquiry(id: number, data: Partial<NewInquiry>): Promise<Inquiry | null> {
  const db = getDb()
  const [updated] = await db
    .update(inquiries)
    .set({ ...data, updated_at: new Date() })
    .where(eq(inquiries.id, id))
    .returning()
  return updated || null
}
