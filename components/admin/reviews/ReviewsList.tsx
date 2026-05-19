'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Star, Plus, Trash2 } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'

import { PageHeader } from '@/components/admin/shared/page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { FilterBar, type FilterConfig } from '@/components/admin/shared/filter-bar'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { Toggle } from '@/components/admin/shared/toggle'
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog'
import { formatRelativeTime } from '@/lib/format'
import type { Review } from '@/db/schema/reviews'

type Stats = { average: number; count: number; distribution: number[] }

const FILTER_CONFIG: FilterConfig[] = [
  { kind: 'search', key: 'search', placeholder: 'Guest name...' },
  {
    kind: 'select',
    key: 'source',
    label: 'Source',
    options: [
      { value: '', label: 'All sources' },
      { value: 'google', label: 'Google' },
      { value: 'manual', label: 'Manual' },
    ],
  },
  {
    kind: 'select',
    key: 'published',
    label: 'Published',
    options: [
      { value: '', label: 'All' },
      { value: 'yes', label: 'Published' },
      { value: 'no', label: 'Unpublished' },
    ],
  },
]

export function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ average: 0, count: 0, distribution: [0, 0, 0, 0, 0] })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ source: '', published: '', search: '' })
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function refetch() {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v))
    return fetch('/api/admin/reviews?' + params)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || [])
        setStats(d.stats || { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] })
      })
  }

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      refetch().finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function togglePublished(id: number, next: boolean) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_published: next }),
    })
    if (!res.ok) {
      toast.error('Toggle failed')
      return
    }
    toast.success(next ? 'Published' : 'Unpublished')
    refetch()
  }

  async function handleDelete() {
    if (!deleteId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/reviews/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Delete failed')
        return
      }
      toast.success('Review deleted')
      refetch()
    } finally {
      setSubmitting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Review>[] = useMemo(
    () => [
      {
        accessorKey: 'guest_name',
        header: 'Guest',
        cell: ({ row }) => <span className="text-foreground font-medium">{row.original.guest_name}</span>,
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ getValue }) => <StarRow value={getValue() as number} />,
      },
      {
        accessorKey: 'review_text',
        header: 'Review',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground line-clamp-2 max-w-[400px]">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => (
          <span className="text-[11px] capitalize text-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'is_published',
        header: 'Published',
        cell: ({ row }) => (
          <Toggle
            checked={row.original.is_published}
            onChange={(next) => togglePublished(row.original.id, next)}
          />
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Added',
        cell: ({ getValue }) => (
          <span className="text-[12px] text-muted-foreground">
            {formatRelativeTime(getValue() as string)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setDeleteId(row.original.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Delete review"
          >
            <Trash2 size={14} />
          </button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <div className="max-w-[1300px]">
      <PageHeader
        title="Reviews"
        subtitle={`${stats.count} published · average ${stats.average.toFixed(1)}/5`}
        actions={
          <Link
            href="/admin/reviews/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg no-underline transition-colors"
          >
            <Plus size={16} /> Add Review
          </Link>
        }
      />

      {/* Stats card */}
      {stats.count > 0 && (
        <div className="bg-card rounded-2xl p-5 mb-5 shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex items-center gap-5">
              <div>
                <div className="text-[42px] font-bold text-foreground leading-none font-admin-mono">
                  {stats.average.toFixed(1)}
                </div>
                <div className="mt-2">
                  <StarRow value={Math.round(stats.average)} size={16} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5">
                  Based on {stats.count} published {stats.count === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star - 1]
                const pct = stats.count > 0 ? (count / stats.count) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-[12px]">
                    <span className="text-muted-foreground w-3">{star}</span>
                    <Star size={11} className="text-accent-deep fill-current" />
                    <div className="flex-1 h-1.5 rounded-full bg-sage-soft overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-muted-foreground font-admin-mono w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <FilterBar filters={filters} onChange={setFilters} config={FILTER_CONFIG} />
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        loading={loading}
        emptyState={
          <EmptyState
            icon={<Star size={32} />}
            title="No reviews yet"
            description="Add manual reviews or import from Google."
            action={{ label: 'Add Review', href: '/admin/reviews/new' }}
          />
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        destructive
        title="Delete this review?"
        message="This cannot be undone."
        confirmLabel="Delete"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

function StarRow({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= value ? 'text-accent-deep fill-current' : 'text-sage-soft'}
        />
      ))}
    </span>
  )
}
