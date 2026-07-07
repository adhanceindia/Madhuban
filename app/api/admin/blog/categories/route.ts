import { apiHandler } from '@/lib/api-handler'
import { listAllCategories, createCategory } from '@/db/queries/blog-admin'
import { blogCategorySchema } from '@/lib/schemas/blog'

export const GET = apiHandler({
  module: 'blog',
  handler: async () => {
    return { categories: await listAllCategories() }
  },
})

export const POST = apiHandler({
  module: 'blog',
  schema: blogCategorySchema,
  audit: { action: 'blog_category.created', entityType: 'blog_category' },
  handler: async ({ body }) => {
    const category = await createCategory(body)
    return { category }
  },
})
