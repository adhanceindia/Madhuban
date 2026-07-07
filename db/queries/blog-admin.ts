import { db } from '@/db'
import { blogPosts, blogCategories, blogTags, blogPostTags } from '@/db/schema/blog'
import { eq, desc } from 'drizzle-orm'
import { NewBlogPost, BlogPost } from '@/db/schema/blog'

export async function listAllBlogPostsAdmin() {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.created_at))
}

export async function getBlogPostByIdAdmin(id: number) {
  const post = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
  return post[0] || null
}

export async function createBlogPost(data: any) {
  const { tags, ...postData } = data
  const result = await db.insert(blogPosts).values(postData).returning()
  const newPost = result[0]

  if (tags && tags.length > 0) {
    await db.insert(blogPostTags).values(tags.map((tagId: number) => ({
      post_id: newPost.id,
      tag_id: tagId,
    })))
  }

  return newPost
}

export async function updateBlogPost(id: number, data: any) {
  const { tags, ...postData } = data
  const result = await db.update(blogPosts).set(postData).where(eq(blogPosts.id, id)).returning()
  const updatedPost = result[0]

  if (tags !== undefined) {
    // Delete old tags
    await db.delete(blogPostTags).where(eq(blogPostTags.post_id, id))
    // Insert new tags
    if (tags.length > 0) {
      await db.insert(blogPostTags).values(tags.map((tagId: number) => ({
        post_id: id,
        tag_id: tagId,
      })))
    }
  }

  return updatedPost
}

export async function deleteBlogPost(id: number) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

export async function listAllCategories() {
  return db.select().from(blogCategories).orderBy(desc(blogCategories.created_at))
}

export async function createCategory(data: any) {
  const result = await db.insert(blogCategories).values(data).returning()
  return result[0]
}

export async function listAllTags() {
  return db.select().from(blogTags).orderBy(desc(blogTags.created_at))
}

export async function createTag(data: any) {
  const result = await db.insert(blogTags).values(data).returning()
  return result[0]
}
