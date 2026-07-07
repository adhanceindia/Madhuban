import { apiHandler } from '@/lib/api-handler'
import { getBlogPostByIdAdmin, updateBlogPost, deleteBlogPost } from '@/db/queries/blog-admin'
import { blogPostUpdateSchema } from '@/lib/schemas/blog'

export const GET = apiHandler({
  module: 'blog',
  handler: async ({ params }) => {
    const { id } = await params
    const post = await getBlogPostByIdAdmin(Number(id))
    if (!post) throw new Error('Blog post not found')
    return { post }
  },
})

export const PUT = apiHandler({
  module: 'blog',
  schema: blogPostUpdateSchema,
  audit: { action: 'blog_post.updated', entityType: 'blog_post' },
  handler: async ({ params, body }) => {
    const { id } = await params
    const post = await updateBlogPost(Number(id), body)
    return { post }
  },
})

export const DELETE = apiHandler({
  module: 'blog',
  audit: { action: 'blog_post.deleted', entityType: 'blog_post' },
  handler: async ({ params }) => {
    const { id } = await params
    await deleteBlogPost(Number(id))
    return { success: true }
  },
})
