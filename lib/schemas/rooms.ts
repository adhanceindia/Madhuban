import { z } from 'zod'

export const roomCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and dashes only'),
  type: z.enum(['standard', 'deluxe', 'suite']),
  price_per_night: z.number().int().positive('Price must be positive'),
  capacity: z.number().int().positive().default(2),
  bed_type: z.string().nullable().optional(),
  room_size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
})

export const roomUpdateSchema = roomCreateSchema.partial()

export type RoomCreateInput = z.infer<typeof roomCreateSchema>
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>
