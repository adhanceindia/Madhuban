'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FileText, Eye, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { format } from 'date-fns'
import type { BlogPost } from '@/db/schema/blog'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/admin/blog/${post.id}`}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent-deep/40 hover:shadow-[0_2px_8px_rgba(45,55,30,0.06)] transition-all no-underline font-admin"
    >
      <div className="w-24 h-20 rounded-lg overflow-hidden bg-sage-soft flex-shrink-0">
        {post.cover_image ? (
          <Image src={post.cover_image} alt={post.title} className="w-full h-full object-cover" width={100} height={80} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage-deep/40">
            <FileText size={28} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-foreground truncate">{post.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{post.slug}</div>
          </div>
          <StatusBadge value={post.is_published ? 'available' : 'blocked'} />
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          {post.published_at && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {format(new Date(post.published_at), 'MMM d, yyyy')}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Eye size={11} /> {post.view_count} views
          </span>
        </div>
      </div>
    </Link>
  )
}
