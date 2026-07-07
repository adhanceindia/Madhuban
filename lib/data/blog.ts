import { db } from '@/db'
import { blogPosts, blogCategories, blogTags, blogPostTags } from '@/db/schema/blog'
import { eq, desc, and, lte, sql } from 'drizzle-orm'
import { users } from '@/db/schema/users'

// Helper to get published posts only
const isPublishedAndPast = and(
  eq(blogPosts.is_published, true),
  lte(blogPosts.published_at, new Date())
)

export async function getPublishedBlogPosts() {
  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      cover_image: blogPosts.cover_image,
      published_at: blogPosts.published_at,
      reading_time_minutes: blogPosts.reading_time_minutes,
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
      },
      author: {
        name: users.name,
      }
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(isPublishedAndPast)
    .orderBy(desc(blogPosts.published_at))

  return posts
}

export async function getBlogPostBySlug(slug: string) {
  const postResult = await db
    .select({
      post: blogPosts,
      category: blogCategories,
      author: users,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(and(eq(blogPosts.slug, slug), isPublishedAndPast))
    .limit(1)

  if (!postResult.length) return null

  const { post, category, author } = postResult[0]

  // Fetch tags
  const tagsResult = await db
    .select({ tag: blogTags })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tag_id, blogTags.id))
    .where(eq(blogPostTags.post_id, post.id))

  const tags = tagsResult.map((t) => t.tag)

  // Increment view count
  await db.update(blogPosts).set({ view_count: sql`${blogPosts.view_count} + 1` }).where(eq(blogPosts.id, post.id))

  return { ...post, category, author, tags }
}

export async function getCategories() {
  return db.select().from(blogCategories)
}

export async function getTags() {
  return db.select().from(blogTags)
}
