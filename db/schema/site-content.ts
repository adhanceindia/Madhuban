import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const siteContent = pgTable('site_content', {
  id: serial('id').primaryKey(),
  page: text('page').notNull().unique(),
  content: jsonb('content').notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type SiteContentRow = typeof siteContent.$inferSelect
export type NewSiteContentRow = typeof siteContent.$inferInsert
