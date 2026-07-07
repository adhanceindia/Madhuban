import { apiHandler } from '@/lib/api-handler'
import { listAllTags, createTag } from '@/db/queries/blog-admin'
import { blogTagSchema } from '@/lib/schemas/blog'

export const GET = apiHandler({
  module: 'blog',
  handler: async () => {
    return { tags: await listAllTags() }
  },
})

export const POST = apiHandler({
  module: 'blog',
  schema: blogTagSchema,
  audit: { action: 'blog_tag.created', entityType: 'blog_tag' },
  handler: async ({ body }) => {
    const tag = await createTag(body)
    return { tag }
  },
})
