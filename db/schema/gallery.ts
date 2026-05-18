import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  media_url: text('media_url').notNull(),
  media_type: text('media_type', { enum: ['image', 'video'] }).notNull().default('image'),
  caption: text('caption'),
  category: text('category', { enum: ['rooms', 'wedding', 'events', 'pool', 'restaurant'] }).notNull(),
  sort_order: integer('sort_order').notNull().default(0),
  album: text('album'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type GalleryItem = typeof gallery.$inferSelect
export type NewGalleryItem = typeof gallery.$inferInsert
