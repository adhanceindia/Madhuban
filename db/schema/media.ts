import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  alt: text('alt').notNull().default(''),
  mime_type: text('mime_type').notNull(),
  size: integer('size'),
  width: integer('width'),
  height: integer('height'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type MediaFile = typeof media.$inferSelect
export type NewMediaFile = typeof media.$inferInsert
