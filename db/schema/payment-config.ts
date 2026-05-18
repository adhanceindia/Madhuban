import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const paymentConfig = pgTable('payment_config', {
  id: serial('id').primaryKey(),
  active_gateway: text('active_gateway', { enum: ['razorpay', 'phonepe', 'cashfree', 'ccavenue', 'payu'] }).notNull().default('razorpay'),
  gateways: jsonb('gateways').notNull().default({}),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PaymentConfigRow = typeof paymentConfig.$inferSelect
