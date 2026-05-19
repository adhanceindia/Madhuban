import { apiHandler } from '@/lib/api-handler'
import { reorderGalleryItems } from '@/db/queries/gallery-admin'
import { galleryReorderSchema } from '@/lib/schemas/gallery'

export const POST = apiHandler({
  module: 'gallery',
  schema: galleryReorderSchema,
  audit: { action: 'gallery.reordered', entityType: 'gallery' },
  handler: async ({ body }) => {
    await reorderGalleryItems(body.updates)
    return { ok: true }
  },
})
