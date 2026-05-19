import { z } from 'zod'

export const reviewCreateSchema = z.object({
  guest_name: z.string().min(1, 'Name is required'),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(1, 'Review text is required'),
  source: z.enum(['google', 'manual']).default('manual'),
  is_published: z.boolean().default(true),
})

export const reviewUpdateSchema = z.object({
  guest_name: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review_text: z.string().min(1).optional(),
  source: z.enum(['google', 'manual']).optional(),
  is_published: z.boolean().optional(),
})

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>
