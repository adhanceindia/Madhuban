import { apiHandler } from '@/lib/api-handler'
import { listAllBlogPostsAdmin, createBlogPost } from '@/db/queries/blog-admin'
import { blogPostCreateSchema } from '@/lib/schemas/blog'

export const GET = apiHandler({
  module: 'blog',
  handler: async () => {
    return { posts: await listAllBlogPostsAdmin() }
  },
})

export const POST = apiHandler({
  module: 'blog',
  schema: blogPostCreateSchema,
  audit: { action: 'blog_post.created', entityType: 'blog_post' },
  handler: async ({ body }) => {
    const post = await createBlogPost(body)
    return { post }
  },
})
