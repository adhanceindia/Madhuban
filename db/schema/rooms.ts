import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['standard', 'deluxe', 'suite'] }).notNull(),
  price_per_night: integer('price_per_night').notNull(),
  capacity: integer('capacity').notNull().default(2),
  quantity: integer('quantity').notNull().default(1),
  extra_bed_price: integer('extra_bed_price').notNull().default(0),
  breakfast_included: boolean('breakfast_included').notNull().default(false),
  bed_type: text('bed_type'),
  room_size: text('room_size'),
  description: text('description'),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  images: jsonb('images').$type<string[]>().default([]),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
