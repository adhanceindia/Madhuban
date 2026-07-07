import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedBlogPosts, getCategories, getTags } from '@/lib/data/blog'
import { getSiteContent } from '@/lib/data'
import { format } from 'date-fns'
import { ArrowRight, Clock } from 'lucide-react'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent()
  return {
    title: 'Blog',
    description: `Read the latest news, updates, and stories from ${site.name}.`,
    openGraph: {
      title: `Blog | ${site.name}`,
      description: `Read the latest news, updates, and stories from ${site.name}.`,
    },
  }
}

export default async function BlogListingPage() {
  const [posts, categories, tags] = await Promise.all([
    getPublishedBlogPosts(),
    getCategories(),
    getTags()
  ])

  return (
    <main className="min-h-screen bg-background pt-[120px] pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Our Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover stories, guides, and updates from Madhuban Garden Resort.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Post List */}
          <div className="lg:col-span-2 space-y-12">
            {posts.length === 0 ? (
              <p className="text-muted-foreground">No posts found.</p>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col md:flex-row">
                  {post.cover_image && (
                    <div className="md:w-2/5 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-muted">
                      {}
                      <Image src={post.cover_image} alt={post.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" fill />
                    </div>
                  )}
                  <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs font-medium mb-3">
                      {post.category && (
                        <Link href={`/blog/category/${post.category.slug}`} className="text-accent hover:text-accent-deep uppercase tracking-wider">
                          {post.category.name}
                        </Link>
                      )}
                      {post.published_at && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          {format(new Date(post.published_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-2xl font-serif text-foreground mb-3 group-hover:text-accent transition-colors">{post.title}</h2>
                    </Link>
                    <p className="text-muted-foreground mb-6 line-clamp-3">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent-deep transition-colors mt-auto">
                      Read Article <ArrowRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-10">
            {/* Categories */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xl font-serif text-foreground mb-4">Categories</h3>
              <ul className="space-y-3">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/blog/category/${c.slug}`} className="text-muted-foreground hover:text-accent transition-colors flex items-center justify-between">
                      <span>{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xl font-serif text-foreground mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link 
                    key={t.id} 
                    href={`/blog/tag/${t.slug}`} 
                    className="px-3 py-1.5 bg-background border border-border rounded-full text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
