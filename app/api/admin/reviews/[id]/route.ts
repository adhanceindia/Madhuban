import { apiHandler } from '@/lib/api-handler'
import { getReviewById, updateReview, deleteReview } from '@/db/queries/reviews-admin'
import { reviewUpdateSchema } from '@/lib/schemas/reviews'
import { logAudit } from '@/lib/audit'

export const PATCH = apiHandler({
  module: 'reviews',
  schema: reviewUpdateSchema,
  handler: async ({ params, body, session }) => {
    const id = parseInt((params as Record<string, string>).id)
    const existing = await getReviewById(id)
    if (!existing) throw new Error('Review not found')
    const updated = await updateReview(id, body)
    await logAudit({
      user_id: session.id,
      action: 'review.updated',
      entity_type: 'review',
      entity_id: id,
      old_value: existing as unknown as Record<string, unknown>,
      new_value: body as Record<string, unknown>,
    })
    return { review: updated }
  },
})

export const DELETE = apiHandler<unknown, { id: string }>({
  module: 'reviews',
  handler: async ({ params, session }) => {
    const id = parseInt(params.id)
    const existing = await getReviewById(id)
    if (!existing) throw new Error('Review not found')
    const ok = await deleteReview(id)
    if (!ok) throw new Error('Delete failed')
    await logAudit({
      user_id: session.id,
      action: 'review.deleted',
      entity_type: 'review',
      entity_id: id,
      old_value: existing as unknown as Record<string, unknown>,
    })
    return { ok: true }
  },
})
