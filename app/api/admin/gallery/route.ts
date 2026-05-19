import { apiHandler } from '@/lib/api-handler'
import { listGalleryAdmin, createGalleryItem } from '@/db/queries/gallery-admin'
import { galleryCreateSchema } from '@/lib/schemas/gallery'

export const GET = apiHandler({
  module: 'gallery',
  handler: async ({ searchParams }) => {
    const category = searchParams.get('category') || undefined
    return { items: await listGalleryAdmin(category) }
  },
})

export const POST = apiHandler({
  module: 'gallery',
  schema: galleryCreateSchema,
  audit: { action: 'gallery.added', entityType: 'gallery' },
  handler: async ({ body }) => {
    const item = await createGalleryItem(body)
    return { item }
  },
})
