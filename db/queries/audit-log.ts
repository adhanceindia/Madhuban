import { getDb } from '@/db/client'
import { auditLog, users } from '@/db/schema'
import { eq, desc, and, gte, lte, ilike, or } from 'drizzle-orm'

export type AuditFilters = {
  user_id?: number
  action?: string
  entity_type?: string
  start_date?: string
  end_date?: string
  search?: string
}

export type AuditRow = {
  id: number
  user_id: number | null
  user_name: string | null
  user_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_value: unknown
  new_value: unknown
  created_at: Date
}

export async function listAuditEntries(filters: AuditFilters = {}): Promise<AuditRow[]> {
  const db = getDb()
  const conditions = []

  if (filters.user_id) conditions.push(eq(auditLog.user_id, filters.user_id))
  if (filters.action) conditions.push(eq(auditLog.action, filters.action))
  if (filters.entity_type) conditions.push(eq(auditLog.entity_type, filters.entity_type))
  if (filters.start_date) conditions.push(gte(auditLog.created_at, new Date(filters.start_date + 'T00:00:00')))
  if (filters.end_date) conditions.push(lte(auditLog.created_at, new Date(filters.end_date + 'T23:59:59')))
  if (filters.search) {
    const q = `%${filters.search}%`
    const c = or(ilike(auditLog.action, q), ilike(auditLog.entity_type, q), ilike(auditLog.entity_id, q))
    if (c) conditions.push(c)
  }

  return db
    .select({
      id: auditLog.id,
      user_id: auditLog.user_id,
      user_name: users.name,
      user_email: users.email,
      action: auditLog.action,
      entity_type: auditLog.entity_type,
      entity_id: auditLog.entity_id,
      old_value: auditLog.old_value,
      new_value: auditLog.new_value,
      created_at: auditLog.created_at,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.user_id, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.created_at))
    .limit(500)
}

export async function getAuditFilters() {
  const db = getDb()
  const allUsers = await db.select({ id: users.id, name: users.name }).from(users)
  return { users: allUsers }
}
