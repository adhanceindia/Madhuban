import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  auth_id: text('auth_id').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', {
    enum: ['super_admin', 'resort_manager', 'front_desk', 'event_manager', 'accountant', 'content_manager', 'customer'],
  }).notNull().default('customer'),
  is_active: boolean('is_active').notNull().default(true),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = User['role']
