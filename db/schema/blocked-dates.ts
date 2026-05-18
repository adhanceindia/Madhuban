import { pgTable, serial, integer, date, text, timestamp } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'

export const blockedDates = pgTable('blocked_dates', {
  id: serial('id').primaryKey(),
  room_id: integer('room_id').notNull().references(() => rooms.id),
  date: date('date').notNull(),
  source: text('source', { enum: ['ical', 'manual'] }).notNull().default('manual'),
  ical_uid: text('ical_uid'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BlockedDate = typeof blockedDates.$inferSelect
export type NewBlockedDate = typeof blockedDates.$inferInsert
