import { apiHandler } from '@/lib/api-handler'
import { updateGalleryItem, deleteGalleryItem } from '@/db/queries/gallery-admin'
import { galleryUpdateSchema } from '@/lib/schemas/gallery'
import { logAudit } from '@/lib/audit'

export const PATCH = apiHandler({
  module: 'gallery',
  schema: galleryUpdateSchema,
  handler: async ({ params, body, session }) => {
    const id = parseInt((params as Record<string, string>).id)
    const updated = await updateGalleryItem(id, body)
    if (!updated) throw new Error('Gallery item not found')
    await logAudit({
      user_id: session.id,
      action: 'gallery.updated',
      entity_type: 'gallery',
      entity_id: id,
      new_value: body as Record<string, unknown>,
    })
    return { item: updated }
  },
})

export const DELETE = apiHandler<unknown, { id: string }>({
  module: 'gallery',
  handler: async ({ params, session }) => {
    const id = parseInt(params.id)
    const ok = await deleteGalleryItem(id)
    if (!ok) throw new Error('Gallery item not found')
    await logAudit({
      user_id: session.id,
      action: 'gallery.removed',
      entity_type: 'gallery',
      entity_id: id,
    })
    return { ok: true }
  },
})
