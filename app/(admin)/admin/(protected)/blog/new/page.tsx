import { BlogEditor } from '@/components/admin/blog/BlogEditor'
import { db } from '@/db'
import { blogCategories, blogTags } from '@/db/schema/blog'

export default async function NewBlogPage() {
  const categories = await db.select().from(blogCategories)
  const tags = await db.select().from(blogTags)

  return <BlogEditor categories={categories} tags={tags} />
}
