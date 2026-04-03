'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Booking = {
  id: string | number
  guest_name: string
  guest_phone: string
  guest_email: string
  room: { id: string | number; name: string } | string | null
  check_in: string
  check_out: string
  nights: number
  guests_count: number
  total_amount: number
  payment_method: string
  payment_status: string
  status: string
  source: string
  createdAt: string
}

type PaginatedResponse = {
  docs: Booking[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getRoomName(room: Booking['room']): string {
  if (!room) return '—'
  if (typeof room === 'string') return room
  return room.name || '—'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
}

// ---------------------------------------------------------------------------
// Status Badge
// ---------------------------------------------------------------------------

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-purple-100 text-purple-800 border-purple-200',
}

function StatusBadge({ value }: { value: string }) {
  const cls = statusStyles[value] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${cls}`}>
      {value.replace(/_/g, ' ')}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function BookingsListClient() {
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const limit = 25

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('page', String(page))
      params.set('sort', '-check_in')
      params.set('depth', '1')
      if (statusFilter) params.set('where[status][equals]', statusFilter)
      if (paymentFilter) params.set('where[payment_status][equals]', paymentFilter)
      if (search) params.set('where[or][0][guest_name][like]', search)

      const res = await fetch(`/api/bookings?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, paymentFilter, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, paymentFilter, search])

  return (
    <div className="p-6">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-primary-light flex items-center justify-center">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-display m-0">Bookings</h1>
            <p className="text-xs text-muted-foreground m-0">
              {data ? `${data.totalDocs} total bookings` : 'Loading...'}
            </p>
          </div>
        </div>
        <Link
          href="/admin/collections/bookings/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-semibold no-underline hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} /> Add Booking
        </Link>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white text-foreground cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white text-foreground cursor-pointer"
        >
          <option value="">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        {/* Export */}
        <button
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-white text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-auto"
          onClick={() => alert('Export feature coming soon')}
        >
          <FileDown size={16} /> Export
        </button>
      </div>

      {/* ---- Table ---- */}
      <Card className="shadow-sm border border-border rounded-xl overflow-hidden">
        {loading && !data ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : !data || data.docs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No bookings found matching your filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.docs.map((booking) => (
                    <tr key={String(booking.id)} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 border-b border-muted text-muted-foreground whitespace-nowrap font-admin-mono text-xs">
                        #{String(booking.id).slice(-6)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(booking.guest_name || '?')}
                          </div>
                          <div>
                            <div className="text-foreground font-medium">{booking.guest_name || '—'}</div>
                            <div className="text-[11px] text-muted-foreground">{booking.guest_phone || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-muted text-foreground whitespace-nowrap">
                        {getRoomName(booking.room)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted text-foreground whitespace-nowrap">
                        {formatDate(booking.check_in)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted text-foreground whitespace-nowrap">
                        {formatDate(booking.check_out)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted text-foreground font-medium font-admin-mono whitespace-nowrap">
                        {formatCurrency(booking.total_amount)}
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <StatusBadge value={booking.payment_status} />
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <StatusBadge value={booking.status} />
                      </td>
                      <td className="px-4 py-3 border-b border-muted whitespace-nowrap">
                        <Link
                          href={`/admin/collections/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary border border-primary/20 rounded-md no-underline hover:bg-primary-light transition-colors"
                        >
                          <Eye size={14} /> View
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
                Page {data.page} of {data.totalPages} · {data.totalDocs} results
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
