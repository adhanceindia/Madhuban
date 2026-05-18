import { pgTable, serial, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entity_type: text('entity_type').notNull(),
  entity_id: text('entity_id'),
  old_value: jsonb('old_value'),
  new_value: jsonb('new_value'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AuditLogEntry = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
