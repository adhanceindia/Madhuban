import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { blogPosts } from '@/db/schema/blog'
import { eq, and, lte, desc } from 'drizzle-orm'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const author = await db.select().from(users).where(eq(users.id, Number(id))).limit(1).then(r => r[0])
  if (!author) return {}
  return { title: `Posts by ${author.name} | Blog` }
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params
  
  const author = await db.select().from(users).where(eq(users.id, Number(id))).limit(1).then(r => r[0])
  if (!author) notFound()

  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(
      eq(blogPosts.author_id, author.id),
      eq(blogPosts.is_published, true),
      lte(blogPosts.published_at, new Date())
    ))
    .orderBy(desc(blogPosts.published_at))

  return (
    <main className="min-h-screen bg-background pt-[120px] pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-accent text-white rounded-full mx-auto flex items-center justify-center text-3xl font-serif mb-4">
            {author.name[0]}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">{author.name}</h1>
          <p className="text-muted-foreground text-lg">Author</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
              {post.cover_image && (
                <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  <Image src={post.cover_image} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" fill />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-serif text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                {post.published_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(post.published_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
