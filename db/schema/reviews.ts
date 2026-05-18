import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  guest_name: text('guest_name').notNull(),
  rating: integer('rating').notNull(),
  review_text: text('review_text').notNull(),
  source: text('source', { enum: ['google', 'manual'] }).notNull().default('manual'),
  is_published: boolean('is_published').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
