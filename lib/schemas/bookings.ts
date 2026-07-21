import { z } from 'zod'

export const bookingCreateSchema = z.object({
  room_id: z.number().int().positive(),
  guest_name: z.string().min(2, 'Name must be at least 2 characters'),
  guest_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  guest_email: z.string().email('Enter a valid email'),
  check_in: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid check-in date'),
  check_out: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid check-out date'),
  guests_count: z.number().int().min(1, 'At least 1 guest required'),
  payment_method: z.enum(['online', 'at_reception']),
  payment_status: z
    .enum(['pending', 'paid', 'failed', 'refunded'])
    .default('pending'),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('confirmed'),
  source: z
    .enum([
      'website',
      'booking_com',
      'mmt',
      'airbnb',
      'agoda',
      'goibibo',
      'manual',
    ])
    .default('manual'),
  total_amount: z.number().int().nonnegative().optional(),
})

export const bookingUpdateSchema = z.object({
  guest_name: z.string().min(2).optional(),
  guest_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  guest_email: z.string().email().optional(),
  check_in: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)))
    .optional(),
  check_out: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)))
    .optional(),
  guests_count: z.number().int().min(1).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled']).optional(),
  total_amount: z.number().int().nonnegative().optional(),
})

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>
