import { pgTable, serial, text, integer, timestamp, date } from 'drizzle-orm/pg-core'
import { rooms } from './rooms.ts'

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  room_id: integer('room_id').notNull().references(() => rooms.id),
  guest_name: text('guest_name').notNull(),
  guest_phone: text('guest_phone').notNull(),
  guest_email: text('guest_email').notNull(),
  check_in: date('check_in').notNull(),
  check_out: date('check_out').notNull(),
  guests_count: integer('guests_count').notNull().default(1),
  total_amount: integer('total_amount'),
  payment_method: text('payment_method', { enum: ['online', 'at_reception'] }).notNull(),
  payment_status: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).notNull().default('pending'),
  status: text('status', { enum: ['confirmed', 'pending', 'cancelled'] }).notNull().default('pending'),
  source: text('source', { enum: ['website', 'booking_com', 'mmt', 'manual'] }).notNull().default('website'),
  gateway_used: text('gateway_used', { enum: ['razorpay', 'phonepe', 'cashfree', 'ccavenue', 'payu'] }),
  gateway_order_id: text('gateway_order_id'),
  gateway_payment_id: text('gateway_payment_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
