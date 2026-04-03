'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Star as StarIcon,
  MessageSquare,
  Search,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Reply,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Review = {
  id: string | number
  guest_name: string
  rating: number
  review_text: string
  source: string
  is_published: boolean
  createdAt: string
}

type PaginatedResponse = {
  docs: Review[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ---------------------------------------------------------------------------
// Star Rating Component
// ---------------------------------------------------------------------------

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rating Donut Chart (SVG)
// ---------------------------------------------------------------------------

function RatingDonut({ rating }: { rating: number }) {
  const radius = 40
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rating / 5) * circumference

  return (
    <div className="relative w-24 h-24">
      <svg width="96" height="96" viewBox="0 0 96 96" className="transform -rotate-90">
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke="#386a0e"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-foreground font-admin-mono">{rating.toFixed(1)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Satisfaction Bar
// ---------------------------------------------------------------------------

function SatisfactionBar({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <div className="text-xs text-muted-foreground">No data</div>
  }

  const bad = reviews.filter((r) => r.rating <= 2).length
  const neutral = reviews.filter((r) => r.rating === 3).length
  const good = reviews.filter((r) => r.rating >= 4).length
  const total = reviews.length

  const badPct = Math.round((bad / total) * 100)
  const neutralPct = Math.round((neutral / total) * 100)
  const goodPct = Math.round((good / total) * 100)

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        {badPct > 0 && (
          <div className="bg-red-400 transition-all duration-500" style={{ width: `${badPct}%` }} />
        )}
        {neutralPct > 0 && (
          <div className="bg-gray-300 transition-all duration-500" style={{ width: `${neutralPct}%` }} />
        )}
        {goodPct > 0 && (
          <div className="bg-green-400 transition-all duration-500" style={{ width: `${goodPct}%` }} />
        )}
      </div>
      <div className="flex justify-between mt-2 text-[11px]">
        <span className="text-red-500 font-medium">{badPct}%</span>
        <span className="text-gray-400 font-medium">{neutralPct}%</span>
        <span className="text-green-500 font-medium">{goodPct}%</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ReviewsClient() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 25

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('page', String(page))
      params.set('sort', '-createdAt')
      if (search) params.set('where[guest_name][like]', search)

      const res = await fetch(`/api/reviews?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }

      // Fetch all for metrics (only on first load)
      if (allReviews.length === 0) {
        const allRes = await fetch('/api/reviews?limit=500')
        if (allRes.ok) {
          const allJson = await allRes.json()
          setAllReviews(allJson.docs || [])
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setPage(1)
  }, [search])

  // Metrics computed from all reviews
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-[10px] bg-gold-light flex items-center justify-center">
          <MessageSquare size={20} className="text-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground font-display m-0">
            Overview & Reviews
          </h1>
          <p className="text-xs text-muted-foreground m-0">
            {allReviews.length} total reviews
          </p>
        </div>
      </div>

      {/* ---- Metric Cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Review Rating */}
        <Card className="p-5 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Review Rating
          </div>
          <div className="flex items-center gap-4">
            <RatingDonut rating={avgRating} />
            <div>
              <div className="text-3xl font-bold text-foreground font-admin-mono">{avgRating.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">out of 5.0</div>
            </div>
          </div>
        </Card>

        {/* All Feedback */}
        <Card className="p-5 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            All Feedback
          </div>
          <div className="text-4xl font-bold text-foreground font-admin-mono mb-2">{allReviews.length}</div>
          <div className="flex gap-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = allReviews.filter((r) => Math.round(r.rating) === rating).length
              const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0
              return (
                <div key={rating} className="flex-1">
                  <div className="h-10 bg-gray-100 rounded relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-primary/80 rounded transition-all duration-500"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center mt-1">{rating}★</div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Avg Satisfaction */}
        <Card className="p-5 shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Avg. Satisfaction
          </div>
          <SatisfactionBar reviews={allReviews} />
          <div className="flex justify-between mt-3 text-[11px] text-muted-foreground">
            <span>😟 Bad</span>
            <span>😐 Neutral</span>
            <span>😊 Good</span>
          </div>
        </Card>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-auto"
          onClick={() => alert('Export feature coming soon')}
        >
          <FileDown size={16} /> Export
        </button>
      </div>

      {/* ---- Reviews Table ---- */}
      <Card className="shadow-sm border border-border rounded-xl overflow-hidden">
        {loading && !data ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : !data || data.docs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No reviews found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Guest', 'Date', 'Rating', 'Review', 'Source', 'Published', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.docs.map((review) => (
                    <tr key={String(review.id)} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gold-light text-gold text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {review.guest_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-foreground font-medium">
                            {review.guest_name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-muted text-muted-foreground whitespace-nowrap">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.rating} size={13} />
                          <span className="text-xs font-medium text-muted-foreground font-admin-mono">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-muted max-w-[300px]">
                        <p className="text-foreground truncate m-0" title={review.review_text}>
                          {review.review_text}
                        </p>
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${
                          review.source === 'google'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {review.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        {review.is_published ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                            <Check size={14} /> Published
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <Link
                          href={`/admin/collections/reviews/${review.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary border border-primary/20 rounded-full no-underline hover:bg-primary-light transition-colors"
                        >
                          <Reply size={13} /> Reply Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Page {data.page} of {data.totalPages} · {data.totalDocs} reviews
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={!data.hasPrevPage}
                  className="p-1.5 rounded-md border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(data.page - 2, data.totalPages - 4))
                  const p = startPage + i
                  if (p > data.totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        p === data.page
                          ? 'bg-primary text-white'
                          : 'bg-white text-muted-foreground border border-border hover:bg-muted'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                  disabled={!data.hasNextPage}
                  className="p-1.5 rounded-md border border-border bg-white text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
