import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/db'
import { blogPosts } from '@/db/schema/blog'
import { eq, and, lte, desc } from 'drizzle-orm'
import { getSiteContent } from '@/lib/data'

export async function GET() {
  const site = await getSiteContent()
  const URL = 'https://madhubangarden.com'
  
  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.is_published, true), lte(blogPosts.published_at, new Date())))
    .orderBy(desc(blogPosts.published_at))
    .limit(20)

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${site.name} Blog</title>
      <link>${URL}/blog</link>
      <description>${site.tagline}</description>
      <atom:link href="${URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
      ${posts.map(post => `
        <item>
          <title><![CDATA[${post.seo_title || post.title}]]></title>
          <link>${URL}/blog/${post.slug}</link>
          <guid>${URL}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.published_at || new Date()).toUTCString()}</pubDate>
          <description><![CDATA[${post.seo_description || post.excerpt}]]></description>
        </item>
      `).join('')}
    </channel>
  </rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  })
}
