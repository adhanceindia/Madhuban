'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Tags } from 'lucide-react'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { BlogCard } from './BlogCard'
import type { BlogPost } from '@/db/schema/blog'

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all')

  useEffect(() => {
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = posts.filter((p) => {
    if (filter === 'published') return p.is_published
    if (filter === 'drafts') return !p.is_published
    return true
  })

  const publishedCount = posts.filter((p) => p.is_published).length

  return (
    <div className="max-w-[1200px]">
      <PageHeader
        title="Blog Posts"
        subtitle={`${posts.length} total · ${publishedCount} published`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/blog/categories-tags"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg no-underline transition-colors border border-border"
            >
              <Tags size={16} /> Manage Taxonomy
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
            >
              <Plus size={16} /> Write Post
            </Link>
          </div>
        }
      />

      <div className="flex gap-1 mb-4 bg-card rounded-lg p-1 border border-border w-fit">
        {(['all', 'published', 'drafts'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-colors capitalize ${
              filter === f
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[100px] bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl py-12">
          <EmptyState
            icon={<FileText size={36} />}
            title={filter === 'all' ? 'No blog posts yet' : `No ${filter} posts`}
            description={
              filter === 'all'
                ? 'Write your first blog post to start driving traffic.'
                : `Switch to "all" to see other posts, or create a new one.`
            }
            action={filter === 'all' ? { label: 'Write Post', href: '/admin/blog/new' } : undefined}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  )
}
