import { notFound } from 'next/navigation'
import { db } from '@/db'
import { blogCategories, blogTags, blogPosts, blogPostTags } from '@/db/schema/blog'
import { eq } from 'drizzle-orm'
import { BlogEditor } from '@/components/admin/blog/BlogEditor'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const postResult = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id))).limit(1)
  const post = postResult[0]

  if (!post) {
    notFound()
  }

  // Fetch associated tags
  const [tagsResult, categories, tags] = await Promise.all([
    db
      .select({ tag: blogTags })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tag_id, blogTags.id))
      .where(eq(blogPostTags.post_id, post.id)),
    db.select().from(blogCategories),
    db.select().from(blogTags)
  ])

  const postTags = tagsResult.map(r => r.tag)

  return <BlogEditor initialData={{ ...post, tags: postTags }} categories={categories} tags={tags} />
}
