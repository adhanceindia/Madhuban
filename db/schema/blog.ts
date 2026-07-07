import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const blogTags = pgTable('blog_tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'), // Rich text content (HTML/JSON)
  cover_image: text('cover_image'),
  author_id: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  category_id: integer('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  is_published: boolean('is_published').notNull().default(false),
  published_at: timestamp('published_at', { withTimezone: true }),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  reading_time_minutes: integer('reading_time_minutes').default(0),
  view_count: integer('view_count').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const blogPostTags = pgTable('blog_post_tags', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tag_id: integer('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
})

export type BlogCategory = typeof blogCategories.$inferSelect
export type NewBlogCategory = typeof blogCategories.$inferInsert

export type BlogTag = typeof blogTags.$inferSelect
export type NewBlogTag = typeof blogTags.$inferInsert

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert

export type BlogPostTag = typeof blogPostTags.$inferSelect
export type NewBlogPostTag = typeof blogPostTags.$inferInsert
