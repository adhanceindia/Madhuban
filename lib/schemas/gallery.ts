import { z } from 'zod'

export const galleryCategoryEnum = z.enum(['rooms', 'wedding', 'events', 'pool', 'restaurant'])

export const galleryCreateSchema = z.object({
  media_url: z.string().url('Must be a valid URL'),
  media_type: z.enum(['image', 'video']).default('image'),
  caption: z.string().nullable().optional(),
  category: galleryCategoryEnum,
  sort_order: z.number().int().default(0),
  album: z.string().nullable().optional(),
})

export const galleryUpdateSchema = z.object({
  caption: z.string().nullable().optional(),
  category: galleryCategoryEnum.optional(),
  album: z.string().nullable().optional(),
  sort_order: z.number().int().optional(),
})

export const galleryReorderSchema = z.object({
  updates: z.array(z.object({ id: z.number().int(), sort_order: z.number().int() })),
})

export type GalleryCreateInput = z.infer<typeof galleryCreateSchema>

export const CATEGORY_LABELS: Record<string, string> = {
  rooms: 'Rooms & Suites',
  wedding: 'Weddings',
  events: 'Events',
  pool: 'Pool',
  restaurant: 'Restaurant',
}
