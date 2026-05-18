import { pgTable, serial, text, integer, date, timestamp } from 'drizzle-orm/pg-core'

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  event_type: text('event_type', { enum: ['wedding', 'birthday', 'corporate', 'other'] }).notNull(),
  event_date: date('event_date'),
  guests_count: integer('guests_count'),
  message: text('message'),
  status: text('status', { enum: ['new', 'contacted', 'closed'] }).notNull().default('new'),
  staff_notes: text('staff_notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Inquiry = typeof inquiries.$inferSelect
export type NewInquiry = typeof inquiries.$inferInsert
