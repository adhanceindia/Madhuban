import { apiHandler } from '@/lib/api-handler'
import { listReviewsAdmin, createReview, getReviewStats } from '@/db/queries/reviews-admin'
import { reviewCreateSchema } from '@/lib/schemas/reviews'

export const GET = apiHandler({
  module: 'reviews',
  handler: async ({ searchParams }) => {
    const filters = {
      source: searchParams.get('source') || undefined,
      published: searchParams.get('published') || undefined,
      search: searchParams.get('search') || undefined,
    }
    const [reviews, stats] = await Promise.all([listReviewsAdmin(filters), getReviewStats()])
    return { reviews, stats }
  },
})

export const POST = apiHandler({
  module: 'reviews',
  schema: reviewCreateSchema,
  audit: { action: 'review.created', entityType: 'review' },
  handler: async ({ body }) => {
    const review = await createReview(body)
    return { review }
  },
})
