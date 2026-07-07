import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBlogPostBySlug } from '@/lib/data/blog'
import { getSiteContent } from '@/lib/data'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Clock, Facebook, Twitter, Linkedin } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getBlogPostBySlug(slug)
  const site = await getSiteContent()

  if (!data) return {}

  const title = data.seo_title || data.title
  const description = data.seo_description || data.excerpt || site.tagline

  return {
    title: `${title} | Blog`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: data.published_at?.toISOString(),
      authors: [data.author?.name || 'Madhuban Garden Resort'],
      images: data.cover_image ? [{ url: data.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.cover_image ? [data.cover_image] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at?.toISOString(),
    dateModified: post.updated_at?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Madhuban Garden Resort',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Madhuban Garden Resort',
      logo: {
        '@type': 'ImageObject',
        url: 'https://madhubangarden.com/icon.svg',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://madhubangarden.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://madhubangarden.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://madhubangarden.com/blog/${post.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="min-h-screen bg-background pt-[120px] pb-24">
        <article className="max-w-[800px] mx-auto px-4 md:px-6">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Blog
            </Link>
          </div>

          <header className="mb-10 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium mb-4">
              {post.category && (
                <Link href={`/blog/category/${post.category.slug}`} className="text-accent uppercase tracking-wider px-2 py-1 bg-accent/10 rounded-sm">
                  {post.category.name}
                </Link>
              )}
              {post.published_at && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {format(new Date(post.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              {(post.reading_time_minutes ?? 0) > 0 && (
                <span className="text-muted-foreground">· {post.reading_time_minutes} min read</span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6 leading-tight">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between border-y border-border py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                  {post.author?.name?.[0] || 'M'}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{post.author?.name || 'Madhuban Garden Resort'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-medium mr-2">Share</span>
                <button className="p-2 hover:text-accent transition-colors" title="Share on Twitter"><Twitter size={18} /></button>
                <button className="p-2 hover:text-accent transition-colors" title="Share on Facebook"><Facebook size={18} /></button>
                <button className="p-2 hover:text-accent transition-colors" title="Share on LinkedIn"><Linkedin size={18} /></button>
              </div>
            </div>
          </header>

          {post.cover_image && (
            <figure className="mb-12 rounded-2xl overflow-hidden shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
            </figure>
          )}

          <div 
            className="prose prose-lg md:prose-xl prose-stone max-w-none 
              prose-headings:font-serif prose-headings:text-foreground
              prose-a:text-accent hover:prose-a:text-accent-deep
              prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-foreground">Tags:</span>
                {post.tags.map((tag: { id: number, slug: string, name: string }) => (
                  <Link 
                    key={tag.id} 
                    href={`/blog/tag/${tag.slug}`}
                    className="px-3 py-1 bg-muted/50 border border-border rounded-full text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  )
}
