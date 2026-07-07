import { MetadataRoute } from 'next'
export const dynamic = 'force-dynamic'
import { db } from '@/db'
import { blogPosts, blogCategories, blogTags } from '@/db/schema/blog'
import { rooms } from '@/db/schema/rooms'
import { eq, and, lte } from 'drizzle-orm'

const URL = 'https://madhubangarden.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.is_published, true), lte(blogPosts.published_at, new Date())))

  const categories = await db.select().from(blogCategories)
  const tags = await db.select().from(blogTags)
  
  const activeRooms = await db.select().from(rooms).where(eq(rooms.is_active, true))

  const routes = [
    '',
    '/rooms',
    '/wedding',
    '/contact',
    '/banquet',
    '/restaurant',
    '/pool',
    '/events',
    '/gallery',
    '/attractions',
    '/blog'
  ].map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const postRoutes = publishedPosts.map(post => ({
    url: `${URL}/blog/${post.slug}`,
    lastModified: post.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const categoryRoutes = categories.map(cat => ({
    url: `${URL}/blog/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const tagRoutes = tags.map(tag => ({
    url: `${URL}/blog/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const roomRoutes = activeRooms.map(room => ({
    url: `${URL}/rooms/${room.slug}`,
    lastModified: room.updated_at || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  return [...routes, ...roomRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes]
}
